import React, { useEffect, useState } from 'react'
import axios from 'axios'

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Paid']

export default function LoanStatusPage () {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [openRows, setOpenRows] = useState([])
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [refreshing, setRefreshing] = useState(false)

  // Fetch loans
  const fetchLoans = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/getAllUsersLoans/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setLoans(res.data)
    } catch (err) {
      // Handle error
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLoans()
  }, [refreshing])

  // Delete loan
  const handleDelete = async id => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setRefreshing(v => !v)
  }

  // Approve loan: set status, add to collateral wallet
  const handleApprove = async loan => {
    // 1. Set loan status to Approved
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/loans/${loan._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      {
        status: 'Approved'
      }
    )
    // 2. Add amount to user collateral wallet
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/loans/addCollateral`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      {
        userId: loan.userId,
        walletId: loan.walletId._id,
        amount: loan.amount
      }
    )
    setRefreshing(v => !v)
  }

  // Decline loan
  const handleDecline = async loan => {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/loans/${loan._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      {
        status: 'Rejected'
      }
    )
    setRefreshing(v => !v)
  }

  // Edit loan
  const handleEdit = loan => {
    setEditId(loan._id)
    setEditData({
      amount: loan.amount,
      status: loan.status
    })
  }
  const handleEditChange = e => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }
  const handleEditSave = async loan => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/loans/${loan._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      {
        amount: editData.amount,
        status: editData.status
      }
    )
    setEditId(null)
    setEditData({})
    setRefreshing(v => !v)
  }

  // Expand progress
  const toggleProgress = id => {
    setOpenRows(prev =>
      prev.includes(id) ? prev.filter(row => row !== id) : [...prev, id]
    )
  }

  const getStatusPercent = status => {
    switch (status) {
      case 'Pending':
        return 25
      case 'Approved':
        return 60
      case 'Paid':
        return 100
      case 'Rejected':
        return 0
      default:
        return 0
    }
  }

  return (
    <div className='loanstatus-bg'>
      <div className='loanstatus-container'>
        <h2>User Loan Status</h2>
        {loading ? (
          <div className='loanstatus-loading'>Loading...</div>
        ) : (
          <div className='loanstatus-table-wrap'>
            <table className='loanstatus-table'>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Wallet</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <React.Fragment key={loan._id}>
                    <tr>
                      <td>
                        {loan.userId.firstname} {loan.userId.lastname}
                      </td>
                      <td>{loan.userId.email}</td>
                      <td>
                        {editId === loan._id ? (
                          <input
                            type='number'
                            name='amount'
                            className='loanstatus-input'
                            value={editData.amount}
                            onChange={handleEditChange}
                          />
                        ) : (
                          `$${loan.amount.toLocaleString()}`
                        )}
                      </td>

                      <td>
                        {editId === loan._id ? (
                          <select
                            name='status'
                            className='loanstatus-select'
                            value={editData.status}
                            onChange={handleEditChange}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`loanstatus-badge ${loan.status.toLowerCase()}`}
                          >
                            {loan.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <span>{loan.walletId?.symbol || '-'}</span>
                          <span className='loanstatus-wallet-balance'>
                            $
                            {loan.walletId?.balance
                              ? loan.walletId.balance.toLocaleString()
                              : 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className='loanstatus-action'
                          title='Show Progress'
                          onClick={() => toggleProgress(loan._id)}
                        >
                          {openRows.includes(loan._id) ? 'Hide' : 'Show'}{' '}
                          Progress
                        </button>
                        {loan.status === 'Pending' && (
                          <>
                            <button
                              className='loanstatus-action loanstatus-approve'
                              onClick={() => handleApprove(loan)}
                            >
                              Approve
                            </button>
                            <button
                              className='loanstatus-action loanstatus-decline'
                              onClick={() => handleDecline(loan)}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button
                          className='loanstatus-action loanstatus-edit'
                          onClick={() =>
                            editId === loan._id
                              ? handleEditSave(loan)
                              : handleEdit(loan)
                          }
                        >
                          {editId === loan._id ? 'Save' : 'Edit'}
                        </button>
                        <button
                          className='loanstatus-action loanstatus-delete'
                          onClick={() => handleDelete(loan._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className='loanstatus-progress-cell'>
                        <div
                          className={`loanstatus-progress-collapse${
                            openRows.includes(loan._id) ? ' open' : ''
                          }`}
                        >
                          {openRows.includes(loan._id) && (
                            <div>
                              <div>
                                <strong>Progress:</strong>
                                <div className='loanstatus-progress-bar'>
                                  <div
                                    className='loanstatus-progress-bar-inner'
                                    style={{
                                      width: `${getStatusPercent(loan.status)}%`
                                    }}
                                  />
                                </div>
                                <span>{getStatusPercent(loan.status)}%</span>
                              </div>
                              <div>
                                <strong>Applied:</strong>{' '}
                                {loan.appliedOn
                                  ? new Date(
                                      loan.appliedOn
                                    ).toLocaleDateString()
                                  : '-'}
                              </div>
                              {loan.documentUrl && (
                                <div>
                                  <a
                                    href={loan.documentUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                  >
                                    📄 View Document
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={6} className='loanstatus-empty'>
                      No loans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
