import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

export default function EarningsPage () {
  const [earningsHistory, setEarningsHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompletedInvestments = async () => {
      if (typeof window === 'undefined') return
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/investments/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const data = res.data?.data || []

        const completed = data.filter(plan => plan.status === 'completed')
        const formatted = completed.map(plan => ({
          id: plan._id,
          title: plan.planName || `Investment #${plan._id.substring(0, 5)}`,
          category: plan.category || 'User Plan',
          amountInvested: plan.amount,
          totalEarnings: plan.expectedReturn - plan.amount,
          startDate: new Date(plan.startDate).toISOString().split('T')[0],
          endDate: plan.nextPayoutDate
            ? new Date(plan.nextPayoutDate).toISOString().split('T')[0]
            : '',
          status: plan.status.charAt(0).toUpperCase() + plan.status.slice(1)
        }))

        setEarningsHistory(formatted)
      } catch (err) {
        console.error('Error fetching investments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompletedInvestments()
  }, [])

  return (
    <>
      <div className='earnings-wrapper'>
        <div className='earnings-container'>
          <h2>Earnings & Investment History</h2>
          {loading ? (
            <div className='loader'>Loading...</div>
          ) : earningsHistory.length === 0 ? (
            <div className='empty-state'>
              <h4>No completed investments</h4>
              <p>Once your investments mature, they’ll show up here.</p>

              <p>
                {' '}
                start investing <a href='/user/InvestmentPlan'>here</a>
              </p>
            </div>
          ) : (
            <div className='earnings-list'>
              {earningsHistory.map(record => (
                <div className='earnings-card' key={record.id}>
                  <div className='card-header'>
                    <span className='plan-title'>{record.title}</span>
                    <span
                      className={`status-badge ${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className='card-category'>{record.category}</div>
                  <div className='card-details'>
                    <div>
                      <span className='label'>Invested</span>
                      <span className='value'>
                        ${Number(record.amountInvested).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className='label'>Earned</span>
                      <span className='value green'>
                        +${Number(record.totalEarnings).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className='card-dates'>
                    <span>
                      <strong>Start:</strong> {record.startDate}
                    </span>
                    <span>
                      <strong>End:</strong> {record.endDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
