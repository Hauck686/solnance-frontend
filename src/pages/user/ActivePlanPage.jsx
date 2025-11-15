import React, { useEffect, useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

dayjs.extend(relativeTime)
dayjs.extend(duration)

const formatDuration = dur =>
  `${dur.months()}m ${dur.days()}d ${dur.hours()}h ${dur.minutes()}m`

/**
 * Calculate UI progress & remaining time using the investment snapshot fields.
 * This prefers:
 *  - investment.durationDays (snapshot) to compute a time-based progress bar
 *  - fallbacks: nextPayoutDate or totalProfit vs totalPaid when durationDays is not available
 */
const calculateProgress = inv => {
  const now = dayjs()
  const start = dayjs(inv.startDate)

  // Prefer explicit durationDays snapshot (number of days)
  const durationDays = Number(inv.durationDays) || 0
  const nextPayout = inv.nextPayoutDate ? dayjs(inv.nextPayoutDate) : null

  let percent = 0
  let remainingDuration = null
  let isComplete = false

  if (durationDays > 0) {
    const end = start.add(durationDays, 'day')
    const totalMs = end.diff(start)
    const elapsedMs = Math.max(0, now.diff(start))
    const remainingMs = Math.max(0, end.diff(now))
    percent = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 100
    remainingDuration = dayjs.duration(remainingMs)
    isComplete = now.isAfter(end) || percent >= 100
  } else if (typeof inv.totalProfit === 'number' && inv.totalProfit > 0) {
    // If we don't have durationDays, fall back to profit progress (money-based)
    const totalProfit = Number(inv.totalProfit)
    const totalPaid = Number(inv.totalPaid) || 0
    percent = Math.min(100, (totalPaid / totalProfit) * 100)
    isComplete = totalPaid >= totalProfit
    // For remaining time, if nextPayout exists use that, otherwise unknown
    if (nextPayout) {
      const remainingMs = Math.max(0, nextPayout.diff(now))
      remainingDuration = dayjs.duration(remainingMs)
    }
  } else if (nextPayout) {
    // No durationDays or totalProfit: show time until next payout
    const remainingMs = Math.max(0, nextPayout.diff(now))
    remainingDuration = dayjs.duration(remainingMs)
    percent = 0
    isComplete = false
  } else {
    percent = 0
    remainingDuration = dayjs.duration(0)
    isComplete = false
  }

  return {
    percent: Number(percent.toFixed(1)),
    remainingDuration,
    isComplete
  }
}

const cashBackAmount = inv => {
  // prefer expectedReturn snapshot, else compute from amount + totalProfit
  if (
    typeof inv.expectedReturn === 'number' &&
    !Number.isNaN(inv.expectedReturn)
  ) {
    return inv.expectedReturn
  }
  const amt = Number(inv.amount) || 0
  const totalProfit = Number(inv.totalProfit) || 0
  return amt + totalProfit
}

const ActivePlanPage = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  const mapInvestment = inv => {
    // Investment document shape expected:
    // inv: {
    //   _id, userId, planId, planName, profitRate, totalProfit,
    //   durationDays, durationType, payoutIntervalDays, dailyProfitRate,
    //   amount, startDate, nextPayoutDate, currentDay, totalPaid, expectedReturn, status ...
    // }

    const planSnapshot = inv // use fields directly from the investment document
    const planRef = inv.planId || {}

    const durationDays = Number(planSnapshot.durationDays) || 0
    const durationType =
      planSnapshot.durationType || planRef.durationType || 'days'
    const payoutIntervalDays =
      Number(planSnapshot.payoutIntervalDays) ||
      Number(planRef.payoutFrequency) ||
      1

    const totalProfit = Number(planSnapshot.totalProfit) || 0
    const totalPaid = Number(planSnapshot.totalPaid) || 0
    const profitRate =
      Number(planSnapshot.profitRate ?? planRef.profitRate) || 0
    const dailyProfitRate =
      Number(planSnapshot.dailyProfitRate) ||
      (planRef.rateType === 'daily' ? Number(planRef.profitRate) : 0)
    const planName =
      planSnapshot.planName ||
      planRef.name ||
      planRef.title ||
      `Investment #${String(inv._id).slice(0, 6)}`
    const amount = Number(planSnapshot.amount) || 0

    const { percent, remainingDuration, isComplete } = calculateProgress({
      startDate: planSnapshot.startDate,
      durationDays,
      totalProfit,
      totalPaid,
      nextPayoutDate: planSnapshot.nextPayoutDate
    })

    // Determine completed payouts using currentDay snapshot when available, else compute from elapsed time
    const currentDay = Number(planSnapshot.currentDay) || 0
    let completedPayouts = 0
    if (currentDay > 0) {
      completedPayouts = Math.floor(currentDay / payoutIntervalDays)
    } else if (planSnapshot.startDate) {
      const start = dayjs(planSnapshot.startDate)
      const now = dayjs()
      const elapsedDays = Math.floor(now.diff(start, 'day'))
      completedPayouts = Math.floor(elapsedDays / payoutIntervalDays)
    }

    const totalPayoutPeriods =
      durationDays > 0 ? Math.ceil(durationDays / payoutIntervalDays) : 1
    const profitPerPayout =
      totalPayoutPeriods > 0 ? totalProfit / totalPayoutPeriods : totalProfit
    const profitSoFar =
      totalPaid > 0
        ? totalPaid
        : Math.min(totalProfit, completedPayouts * profitPerPayout)

    return {
      ...inv,
      planName,
      profitRate,
      dailyProfitRate,
      totalProfit,
      totalPaid,
      profitSoFar,
      payoutIntervalDays,
      completedPayouts,
      totalPayoutPeriods,
      durationDays,
      durationType,
      percent,
      remainingDuration,
      isComplete,
      amount,
      cashBack: cashBackAmount(inv)
    }
  }

  const fetchInvestments = async () => {
    try {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined')
        token = localStorage.getItem('authToken')
      setToken(token)

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = res.data?.data || []
      const mapped = data.map(mapInvestment)

      setInvestments(mapped)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching investments:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()

    const interval = setInterval(() => {
      setInvestments(prev =>
        prev.map(inv => {
          const refreshed = mapInvestment(inv)
          // preserve live-updating numeric fields that the server may have provided
          return {
            ...inv,
            percent: refreshed.percent,
            remainingDuration: refreshed.remainingDuration,
            isComplete: refreshed.isComplete
          }
        })
      )
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='page'>
      <div className='active-plan-wrapper'>
        <h5>Active Investment Plans</h5>
        <div className='active-plan-container'>
          {loading && <p>Loading investments...</p>}

          {!loading && investments.length === 0 && (
            <p>
              No investments found.{' '}
              <a href='/user/InvestmentPlan'>Start investing</a>
            </p>
          )}

          {investments.map(plan => (
            <div key={plan._id} className='active-plan-card'>
              <div className='plan-info'>
                <h5>{plan.planName}</h5>
                <p>
                  Category: <span>{plan.planId?.category || 'User Plan'}</span>
                </p>

                <p>
                  Start Date:{' '}
                  <span>
                    {dayjs(plan.startDate).format('MMM D, YYYY hh:mm A')}
                  </span>
                </p>

                <p>
                  Amount Invested: <span>${plan.amount.toLocaleString()}</span>
                </p>

                <p>
                  Total Cash Back:{' '}
                  <span>${Number(plan.cashBack).toLocaleString()}</span>
                </p>

                <p>
                  Profit Rate: <span>{plan.profitRate}%</span>
                </p>

                <p>
                  Duration:{' '}
                  <span>
                    {plan.durationDays > 0
                      ? `${plan.durationDays} days`
                      : plan.durationType}
                  </span>
                </p>

                <p>
                  Payout Interval (days): <span>{plan.payoutIntervalDays}</span>
                </p>

                <p>
                  Total Expected Profit:{' '}
                  <span>${Number(plan.totalProfit || 0).toFixed(2)}</span>
                </p>

                <p>
                  Profit So Far:{' '}
                  <span>${Number(plan.profitSoFar || 0).toFixed(2)}</span>
                </p>

                <p>
                  Completed Payouts:{' '}
                  <span>
                    {plan.completedPayouts}/{plan.totalPayoutPeriods}
                  </span>
                </p>
              </div>

              <p>
                {plan.isComplete ? (
                  '✅ Completed'
                ) : (
                  <>
                    ⏳{' '}
                    {plan.remainingDuration
                      ? formatDuration(plan.remainingDuration)
                      : 'Calculating...'}
                  </>
                )}
              </p>

              <div className='progress-bar-wrapper'>
                <div className='progress-bar'>
                  <div
                    className='progress-fill'
                    style={{ width: `${plan.percent}%` }}
                  />
                </div>
                <span className='progress-percent'>{plan.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ActivePlanPage
