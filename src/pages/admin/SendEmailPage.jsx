'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function SendEmailPage () {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUsers()
  }, [])

  // Send email handler
  const sendEmail = async () => {
    if (!selectedUser || !subject || !message) {
      alert('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/send-email`,
        {
          userId: selectedUser,
          subject,
          message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('Email sent successfully')
      setSubject('')
      setMessage('')
      setSelectedUser('')
    } catch (err) {
      console.error(err)
      alert('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Send Email to User</h1>

      <div style={{ marginTop: '20px' }}>
        <label>User</label>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        >
          <option value=''>Select user</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.firstname} {u.lastname} — {u.email}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Subject</label>
        <input
          type='text'
          value={subject}
          onChange={e => setSubject(e.target.value)}
          style={{ width: '100%', padding: '10px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows='6'
          style={{ width: '100%', padding: '10px' }}
        ></textarea>
      </div>

      <button
        onClick={sendEmail}
        disabled={loading}
        style={{
          marginTop: '20px',
          padding: '15px',
          width: '100%',
          background: loading ? '#aaa' : '#000',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Sending...' : 'Send Email'}
      </button>
    </div>
  )
}
