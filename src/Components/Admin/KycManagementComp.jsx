'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'

export default function KYCDashboard () {
  const [kycUsers, setKycUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const fetchKycUsers = async () => {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/kyc/all/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setKycUsers(res.data) // API already gives user + kyc object
      } catch (error) {
        console.error('Failed to fetch KYC users:', error)
      }
    }

    fetchKycUsers()
  }, [])

  const handleDecision = async (userId, decision) => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/kyc/${userId}/${decision}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Update UI immediately
      setKycUsers(prev =>
        prev.map(u =>
          u._id === userId ? { ...u, kyc: { ...u.kyc, status: decision } } : u
        )
      )

      setSelectedUser(null)
    } catch (err) {
      console.error(`Failed to ${decision} KYC:`, err)
    }
  }

  return (
    <div className='kyc-dashboard'>
      <h3>KYC Verification Dashboard</h3>

      <div className='kyc-grid'>
        {kycUsers.map(user => (
          <div key={user._id} className='kyc-card'>
            <img
              src={user.kyc?.idDocumentUrl}
              alt='ID Document'
              className='doc-preview'
            />

            <div className='kyc-info'>
              <h4>
                {user.firstname} {user.lastname}
              </h4>
              <p>{user.email}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status ${user.kyc?.status}`}>
                  {user.kyc?.status}
                </span>
              </p>
              <p>
                <strong>Submitted:</strong>{' '}
                {dayjs(user.kyc?.submittedAt).format('YYYY-MM-DD HH:mm')}
              </p>
            </div>

            <button className='view-btn' onClick={() => setSelectedUser(user)}>
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className='kyc-modal'>
          <div className='modal-content'>
            <h4>KYC Details</h4>
            <p>
              <strong>Name:</strong> {selectedUser.firstname}{' '}
              {selectedUser.lastname}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedUser.phoneNumber}
            </p>

            <hr />

            <p>
              <strong>DOB:</strong> {selectedUser.kyc?.dateOfBirth}
            </p>
            <p>
              <strong>Nationality:</strong> {selectedUser.kyc?.nationality}
            </p>
            <p>
              <strong>Address:</strong> {selectedUser.kyc?.address}
            </p>
            <p>
              <strong>Next of Kin:</strong> {selectedUser.kyc?.nextOfKin}
            </p>
            <p>
              <strong>Mother’s Maiden Name:</strong>{' '}
              {selectedUser.kyc?.maidenName}
            </p>

            <img
              src={selectedUser.kyc?.idDocumentUrl}
              alt='Document'
              className='doc-large'
            />

            <div className='modal-actions'>
              <button
                className='approve'
                onClick={() => handleDecision(selectedUser._id, 'approved')}
              >
                Approve
              </button>
              <button
                className='reject'
                onClick={() => handleDecision(selectedUser._id, 'rejected')}
              >
                Reject
              </button>
              <button className='close' onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
