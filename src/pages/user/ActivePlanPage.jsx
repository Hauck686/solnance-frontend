import React, { useEffect, useState } from 'react'

import axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

dayjs.extend(relativeTime)
dayjs.extend(duration)

const calculateProgress = (startDate, durationValue, durationType) => {
  const now = dayjs()
  const start = dayjs(startDate)

  let end
  switch (durationType) {
    case 'weeks':
      end = start.add(durationValue, 'week')
      break
    case 'months':
      end = start.add(durationValue, 'month')
      break
    case 'days':
    default:
      end = start.add(durationValue, 'day')
      break
  }

  const total = end.diff(start)
  const elapsed = now.diff(start)
  const remaining = Math.max(0, end.diff(now))
  const percent =
    total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100

  return {
    percent: percent.toFixed(1),
    remainingDuration: dayjs.duration(isNaN(remaining) ? 0 : remaining),
    isComplete: now.isAfter(end)
  }
}

const ActivePlanPage = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  const fetchInvestments = async () => {
    try {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      setToken(token)

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/investments/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = res.data?.data || []

      const processed = data.map(plan => {
        const durationType =
          plan.durationType || plan.planId?.durationType || 'days'
        const durationValue =
          plan.durationDays || plan.planId?.durationDays || 0
        const payoutFrequency = Number(plan.planId?.payoutFrequency) || 1
        const profitRate = Number(plan.planId?.profitRate) || 0
        const amount = Number(plan.amount) || 0

        // Progress %
        const progress = calculateProgress(
          plan.startDate,
          durationValue,
          durationType
        )

        // Figure out elapsed time
        const start = new Date(plan.startDate)
        const now = new Date()
        let elapsedUnits = 0

        if (durationType.startsWith('day')) {
          elapsedUnits = Math.floor((now - start) / (1000 * 60 * 60 * 24))
        } else if (durationType.startsWith('week')) {
          elapsedUnits = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7))
        } else if (durationType.startsWith('month')) {
          elapsedUnits =
            (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth())
        }

        // Payout logic
        const completedPayouts = Math.floor(elapsedUnits / payoutFrequency)
        const totalPayoutPeriods = Math.ceil(durationValue / payoutFrequency)

        // Profit so far
        let profitSoFar = (amount * profitRate * completedPayouts) / 100
        const totalExpectedProfit =
          (amount * profitRate * totalPayoutPeriods) / 100

        // Cap profit at total expected
        if (profitSoFar > totalExpectedProfit) {
          profitSoFar = totalExpectedProfit
        }

        return {
          ...plan,
          ...progress,
          name:
            plan.planId?.name ||
            plan.planId?.title ||
            `Investment #${plan._id.substring(0, 5)}`,
          category: plan.planId?.category || 'User Plan',
          profitSoFar: profitSoFar.toFixed(2),
          totalExpectedProfit: totalExpectedProfit.toFixed(2),
          payoutFrequency,
          completedPayouts,
          durationType,
          durationValue
        }
      })

      setInvestments(processed)
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
        prev.map(plan => {
          const durationType = plan.durationType || 'days'
          const progress = calculateProgress(
            plan.startDate,
            plan.durationValue,
            durationType
          )
          return { ...plan, ...progress }
        })
      )
    }, 1000) // update every 1s

    return () => clearInterval(interval)
  }, [])

  const cashBack = plan => {
    return plan.expectedReturn ?? plan.amount + (plan.profit || 0)
  }

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
                <h5>{plan.category}</h5>
                <p>
                  Plan: <span>{plan.name}</span>
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
                  <span>${cashBack(plan).toLocaleString()}</span>
                </p>
                <p>
                  Profit Rate: <span>{plan.planId?.profitRate}%</span>
                </p>
                <p>
                  Duration: {plan.durationValue} {plan.durationType}
                </p>
              </div>

              <p>
                {plan.isComplete ? (
                  '✅ Completed'
                ) : (
                  <>
                    ⏳{' '}
                    {plan.remainingDuration
                      ? `${plan.remainingDuration.months()}m ${plan.remainingDuration.days()}d ${plan.remainingDuration.hours()}h ${plan.remainingDuration.minutes()}m left`
                      : 'Calculating...'}
                  </>
                )}
              </p>

              <div className='progress-bar-wrapper'>
                <div className='progress-bar'>
                  <div
                    className='progress-fill'
                    style={{ width: `${plan.percent}%` }}
                  ></div>
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
