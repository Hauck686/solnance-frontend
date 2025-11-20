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
 * calculateProgress(inv)
 *
 * Behavior:
 * 1. If durationDays is present -> overall time-based progress (start -> start+durationDays).
 * 2. Else if totalProfit > 0 and totalPaid > 0 -> money-based overall progress.
 * 3. Else if nextPayoutDate exists -> progress within the current payout interval
 *    (lastPayout || startDate) -> nextPayoutDate. This makes the bar move smoothly
 *    even when the server hasn't recorded totalPaid/currentDay yet.
 * 4. Fallback -> zero progress.
 */
const calculateProgress = inv => {
  const now = dayjs()
  const start = inv.startDate ? dayjs(inv.startDate) : null

  const durationDays = Number(inv.durationDays) || 0
  const nextPayout = inv.nextPayoutDate ? dayjs(inv.nextPayoutDate) : null

  const totalProfit = Number(inv.totalProfit) || 0
  const totalPaid = Number(inv.totalPaid) || 0

  let percent = 0
  let remainingDuration = null
  let isComplete = false

  // 1) Explicit duration -> overall time progress
  if (durationDays > 0 && start) {
    const end = start.add(durationDays, 'day')
    const totalMs = end.diff(start)
    const elapsedMs = Math.max(0, now.diff(start))
    const remainingMs = Math.max(0, end.diff(now))
    percent = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 100
    remainingDuration = dayjs.duration(remainingMs)
    isComplete = now.isAfter(end) || percent >= 100
    return {
      percent: Number(percent.toFixed(1)),
      remainingDuration,
      isComplete
    }
  }

  // 2) Money-based overall progress if server recorded payouts
  if (totalProfit > 0 && totalPaid > 0) {
    percent = Math.min(100, (totalPaid / totalProfit) * 100)
    isComplete = totalPaid >= totalProfit
    if (nextPayout) {
      const remainingMs = Math.max(0, nextPayout.diff(now))
      remainingDuration = dayjs.duration(remainingMs)
    }
    return {
      percent: Number(percent.toFixed(1)),
      remainingDuration,
      isComplete
    }
  }

  // 3) No duration and no recorded money progress -> show progress within current payout interval
  //    This gives live movement between start (or lastPayout) and nextPayout so the UI isn't static.
  if (nextPayout && start) {
    // lastPayout: prefer an explicit lastPayoutDate, else use startDate
    const lastPayout = inv.lastPayoutDate ? dayjs(inv.lastPayoutDate) : start
    const intervalMs = Math.max(1, nextPayout.diff(lastPayout)) // avoid div by 0
    const elapsedInInterval = Math.max(0, now.diff(lastPayout))
    const remainingMs = Math.max(0, nextPayout.diff(now))
    const intervalPercent = Math.min(
      100,
      (elapsedInInterval / intervalMs) * 100
    )

    // Overall completion unknown here (we can't determine end of plan), so isComplete is false.
    return {
      percent: Number(intervalPercent.toFixed(1)),
      remainingDuration: dayjs.duration(remainingMs),
      isComplete: false
    }
  }

  // 4) Nothing useful -> zero progress
  return {
    percent: 0,
    remainingDuration: dayjs.duration(0),
    isComplete: false
  }
}

const cashBackAmount = inv => {
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

  const mapInvestment = rawInv => {
    const planSnapshot = rawInv
    const planRef = rawInv.planId || {}

    const durationDays =
      Number(planSnapshot.durationDays ?? planRef.durationDays) || 0
    const durationType =
      planSnapshot.durationType || planRef.durationType || 'days'
    const payoutIntervalDays =
      Number(planSnapshot.payoutIntervalDays) ||
      Number(planRef.payoutFrequency) ||
      7

    const totalProfit = Number(planSnapshot.totalProfit) || 0
    const totalPaid = Number(planSnapshot.totalPaid) || 0
    const profitRate =
      Number(planSnapshot.profitRate ?? planRef.profitRate) || 0
    const planName =
      planSnapshot.planName ||
      planRef.name ||
      planRef.title ||
      `Investment #${String(rawInv._id).slice(0, 6)}`
    const amount = Number(planSnapshot.amount) || 0

    const { percent, remainingDuration, isComplete } = calculateProgress({
      startDate: planSnapshot.startDate,
      durationDays,
      totalProfit,
      totalPaid,
      nextPayoutDate: planSnapshot.nextPayoutDate,
      lastPayoutDate: planSnapshot.lastPayoutDate
    })

    // Determine completed payouts using currentDay snapshot when available, else derive from elapsed days
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

    // If durationDays > 0 we can compute total payout periods, otherwise keep as unknown (1)
    const totalPayoutPeriods =
      durationDays > 0 ? Math.ceil(durationDays / payoutIntervalDays) : 1
    const profitPerPayout =
      totalPayoutPeriods > 0 ? totalProfit / totalPayoutPeriods : totalProfit
    const profitSoFar =
      totalPaid > 0
        ? totalPaid
        : Math.min(totalProfit, completedPayouts * profitPerPayout)

    return {
      ...rawInv,
      _raw: rawInv,
      planName,
      profitRate,
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
      cashBack: cashBackAmount(rawInv)
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
          const raw = inv._raw || inv
          const refreshed = mapInvestment(raw)
          return {
            ...inv,
            percent: refreshed.percent,
            remainingDuration: refreshed.remainingDuration,
            isComplete: refreshed.isComplete,
            completedPayouts: refreshed.completedPayouts,
            profitSoFar: refreshed.profitSoFar
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
                  Payout Interval :{' '}
                  <span>
                    {plan.payoutIntervalDays}{' '}
                    {plan.durationDays > 0
                      ? `${plan.durationDays} days`
                      : plan.durationType}
                  </span>
                </p>
                <p>
                  Total Expected Profit:{' '}
                  <span>${Number(plan.totalProfit || 0).toFixed(2)}</span>
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
