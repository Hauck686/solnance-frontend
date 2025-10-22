'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function TransactionsDashboard () {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdraws: 0,
    balance: 0,
    depositsCount: 0,
    withdrawsCount: 0,
    totalTransactions: 0
  })

  const fetchTransactions = async () => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const data = res.data?.data || []

      // Calculate stats
      const deposits = data.filter(
        t => t.type === 'Deposit' && t.status === 'success'
      )
      const withdraws = data.filter(
        t => t.type === 'Withdraw' && t.status === 'success'
      )

      const totalDeposits = deposits.reduce((acc, t) => acc + t.amount, 0)
      const totalWithdraws = withdraws.reduce((acc, t) => acc + t.amount, 0)

      setStats({
        totalDeposits,
        totalWithdraws,
        balance: totalDeposits - totalWithdraws,
        depositsCount: deposits.length,
        withdrawsCount: withdraws.length,
        totalTransactions: data.length
      })

      setTransactions(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <>
      <div className='transactions-dashboard'>
        <h2>Transactions Dashboard</h2>

        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className='stats-grid'>
              <div className='stat-card'>
                <h4>Total Deposits</h4>
                <p>${stats.totalDeposits.toLocaleString()}</p>
                <small>{stats.depositsCount} deposits</small>
              </div>
              <div className='stat-card'>
                <h4>Total Withdrawals</h4>
                <p>${stats.totalWithdraws.toLocaleString()}</p>
                <small>{stats.withdrawsCount} withdraws</small>
              </div>
              <div className='stat-card'>
                <h4>Balance</h4>
                <p>${stats.balance.toLocaleString()}</p>
              </div>
              <div className='stat-card'>
                <h4>Total Transactions</h4>
                <p>{stats.totalTransactions}</p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className='transactions-list'>
              <h3>Recent Transactions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Coin</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td>{tx.type}</td>
                      <td>{tx.coin}</td>
                      <td>${tx.amount.toLocaleString()}</td>
                      <td>{tx.status}</td>
                      <td>{tx.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <style jsx>{`
          .transactions-dashboard {
            padding: 20px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: #fff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }
          .stat-card h4 {
            margin: 0;
            font-size: 14px;
            color: #555;
          }
          .stat-card p {
            margin: 6px 0;
            font-size: 20px;
            font-weight: bold;
          }
          .transactions-list table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }
          .transactions-list th,
          .transactions-list td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .transactions-list th {
            background: #f7f7f7;
          }
        `}</style>
      </div>
    </>
  )
}
