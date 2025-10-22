import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { FaPlus, FaSearch } from 'react-icons/fa'
import dayjs from 'dayjs'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

export default function LoansPage () {
  const [loans, setLoans] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getVerifiedUserId()
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/loans/getLoanHistory/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        .then(res => setLoans(res.data))
        .catch(err => console.error('Error fetching loans:', err))
    }
    fetchUserId()
  }, [])

  const filteredLoans = loans.filter(loan =>
    loan._id.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <>
      <div className='loans-page'>
        <div className='loan-content container'>
          {/* Header */}
          <div className='loan-header'>
            <h2>Crypto Loan Dashboard</h2>
            <a href='/user/ApplyLoanPage' className='apply-btn'>
              <FaPlus />
              <span>Apply for Loan</span>
            </a>
          </div>

          {/* Stats */}
          <div className='loan-stats'>
            <div className='stat-card'>
              <p>Total Approved</p>
              <h3>
                $
                {loans
                  .filter(l => l.status === 'Approved')
                  .reduce((a, b) => a + b.amount, 0)
                  .toLocaleString()}
              </h3>
            </div>
            <div className='stat-card'>
              <p>Pending Loans</p>
              <h3>{loans.filter(l => l.status === 'Pending').length}</h3>
            </div>
            <div className='stat-card'>
              <p>Rejected Loans</p>
              <h3>{loans.filter(l => l.status === 'Rejected').length}</h3>
            </div>
          </div>

          {/* Search */}
          <div className='loan-list-search'>
            <FaSearch />
            <input
              type='text'
              placeholder='Search loan ID...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Loan List */}
          <div className='loan-list'>
            {filteredLoans.length === 0 ? (
              <div className='empty-loans'>
                <img src='/empty-box.svg' alt='No Loans' />
                <h4>No loans found</h4>
                <p>Apply for a loan to see it listed here.</p>
              </div>
            ) : (
              filteredLoans.map(loan => (
                <div className='loan-card' key={loan._id}>
                  {/* Top Section */}
                  <div className='loan-card-top'>
                    <span className='loan-id'>
                      Loan <b>#{loan._id.slice(-6).toUpperCase()}</b>
                    </span>
                    <span
                      className={`status-badge ${loan.status.toLowerCase()}`}
                    >
                      {loan.status}
                    </span>
                  </div>

                  {/* Loan Info */}
                  <div className='loan-card-info'>
                    <div>
                      <span className='label'>Amount</span>
                      <span className='value'>
                        ${loan.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className='label'>Term</span>
                      <span className='value'>
                        {loan.loanId?.duration} {loan.loanId?.durationType}
                      </span>
                    </div>
                    <div>
                      <span className='label'>Interest</span>
                      <span className='value'>
                        {loan.loanId?.interestRate}% {loan.loanId?.interestType}
                      </span>
                    </div>
                    <div>
                      <span className='label'>Total Repayment</span>
                      <span className='value'>
                        ${loan.totalRepayment?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className='label'>Repayment Plan</span>
                      <span className='value'>
                        {loan.loanId?.repaymentFrequency} (
                        {loan.loanId?.installments} installments)
                      </span>
                    </div>
                    <div>
                      <span className='label'>Collateral Wallet</span>
                      <span className='value'>
                        {loan.walletId?.symbol} - $
                        {loan.walletId?.balance?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className='loan-card-dates'>
                    <span>
                      <strong>Applied:</strong>{' '}
                      {dayjs(loan.appliedOn).format('MMM D, YYYY')}
                    </span>
                    {loan.approvedOn && (
                      <span>
                        <strong>Approved:</strong>{' '}
                        {dayjs(loan.approvedOn).format('MMM D, YYYY')}
                      </span>
                    )}
                    {loan.rejectedOn && (
                      <span>
                        <strong>Rejected:</strong>{' '}
                        {dayjs(loan.rejectedOn).format('MMM D, YYYY')}
                      </span>
                    )}
                    <span>
                      <strong>Due:</strong>{' '}
                      {dayjs(loan.dueDate).format('MMM D, YYYY')}
                    </span>
                  </div>

                  {/* Document Proof */}
                  {loan.documentUrl && (
                    <div className='loan-doc'>
                      <a
                        href={loan.documentUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='doc-link'
                      >
                        📄 View Uploaded Document
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='loan-card-actions'>
                    <button className='view-btn'>View Details</button>
                    {loan.status === 'Approved' && (
                      <button className='repay-btn'>Make Repayment</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
