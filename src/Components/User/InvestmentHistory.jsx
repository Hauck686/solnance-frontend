import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

// const typeToIcon = {
//   Deposit: '⬆️',
//   Withdraw: '⬇️',
//   Interest: '💰',
//   Investment: '💰',
//   Dividend: '🏦',
//   Buy: '🪙'
// }

const typeToColor = {
  Deposit: '#fff',
  Withdraw: '#fff',
  Interest: '#fff',
  Investment: '#fff',
  Dividend: '#fff',
  Buy: '#fff'
}

export default function InvestmentHistory ({ limit, title }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const sorted = [...(res.data.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        setHistory(limit ? sorted.slice(0, limit) : sorted)
      } catch (err) {
        console.error('Error fetching transactions:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [limit])

  return (
    <section className='investment-history'>
      <div className='history-header'>{title}</div>

      {loading ? (
        <div className='loading'>Loading...</div>
      ) : history.length === 0 ? (
        <div className='no-history'>No transaction history found.</div>
      ) : (
        <div className='history-list'>
          {history.map(item => (
            <div className='history-item' key={item._id}>
              <div className='history-details'>
                <div className='history-row'>
                  <span className='history-type'>{item.type}</span>
                  <span
                    className={`history-amount ${
                      ['Deposit', 'Interest', 'Dividend', 'Buy'].includes(
                        item.type
                      )
                        ? 'positive'
                        : 'negative'
                    }`}
                  >
                    {item.type === 'Withdraw' ? '-' : '+'}$
                    {item.amount?.toLocaleString()}
                  </span>
                </div>

                <div className='history-row'>
                  <span className='history-date'>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span
                    className={`history-status ${item.status?.toLowerCase()}`}
                    title={item.status}
                  >
                    {item.status}
                  </span>
                </div>

                <div className='history-row'>
                  <span className='history-method'>
                    <strong>Method:</strong> {item.method}
                  </span>
                  <span className='history-coin'>
                    <strong>Coin:</strong> {item.coin}
                  </span>
                </div>

                {item.receipt && (
                  <div className='history-desc'>
                    <a
                      href={item.receipt}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      📎 View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
