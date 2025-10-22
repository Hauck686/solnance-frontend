'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Mails, MapPin, Phone, UserPen } from 'lucide-react'

function getInitials (firstname = '', lastname = '') {
  return `${firstname[0] || ''}${lastname[0] || ''}`.toUpperCase()
}

export default function UserTable () {
  const [users, setUsers] = useState([])
  const [walletUserId, setWalletUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [wallets, setWallets] = useState([])
  const [editUser, setEditUser] = useState({})
  const [search, setSearch] = useState('')

  const getUser = async () => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  const openUserModal = async userId => {
    console.log('open modal')
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSelectedUser(res.data.user)
      //(res.data.user)

      setWallets(res.data.wallets)
      setEditUser(res.data.user) // preload form
      setWalletUserId(res.data.wallets[0].userId)
    } catch (err) {
      console.error(err)
    }
  }

  const closeModal = () => {
    setSelectedUser(null)
    setWallets([])
    setEditUser({})
  }

  // update user info
  const handleUserUpdate = async () => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${walletUserId}`,
        editUser,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      alert('User updated')
      setSelectedUser(res.data.user)
      //(res.data.user)
      getUser()
    } catch (err) {
      console.error(err)
    }
  }

  // update wallet balance
  const handleWalletUpdate = async (userId, walletId, action) => {
    const amount = parseFloat(prompt(`Enter amount to ${action}`))
    if (!amount || isNaN(amount)) return

    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/wallet/${walletId}`,
        { amount, action },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      alert('Wallet updated')
      setWallets(prev =>
        prev.map(w => (w._id === walletId ? res.data.wallet : w))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const filteredUsers = users.filter(
    u =>
      (u.firstname + ' ' + u.lastname)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.userCountry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='user-management'>
      <div className='user-management__header'>
        <div className='user-management__title'>
          <span className='user-management__icon'>
            <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
              <circle cx='16' cy='16' r='16' fill='#F1F5F9' />
              <path
                d='M16 18.667c2.578 0 7.333 1.293 7.333 3.867v1.133c0 .62-.513 1.12-1.134 1.12H9.8a1.12 1.12 0 0 1-1.134-1.12v-1.133c0-2.574 4.755-3.867 7.334-3.867Zm0-9.334a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z'
                fill='#2563eb'
              />
            </svg>
          </span>
          <div>
            <h1>User Management</h1>
            <p>Manage users and their wallets</p>
          </div>
        </div>
        <div className='user-management__count'>
          <strong>{users.length}</strong> Total Users
        </div>
      </div>
      <div className='user-management__search'>
        <input
          type='text'
          placeholder='Search users...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='user-management__grid'>
        {filteredUsers.map(user => (
          <div key={user._id} className='user-card'>
            <div className='user-card__avatar'>
              <span>{getInitials(user.firstname, user.lastname)}</span>
            </div>
            <button
              className='user-card__edit'
              onClick={() => openUserModal(user._id)}
            >
              <UserPen />
            </button>
            <div className='user-card__info'>
              <h3>
                {user.firstname} {user.lastname}
              </h3>
              <p>
                <span className='user-card__icon'>
                  <Mails size={16} />
                </span>
                {user.email}
              </p>
              <p>
                <span className='user-card__icon'>
                  <Phone size={16} />
                </span>
                {user.phoneNumber}
              </p>
              <p>
                <span className='user-card__icon'>
                  <MapPin size={16} />
                </span>
                {user.userCountry}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className='modal'>
          <div className='modal-content'>
            <button onClick={closeModal}>✖</button>
            <h3>Edit User</h3>
            <input
              type='text'
              value={editUser.firstname || ''}
              onChange={e =>
                setEditUser({ ...editUser, firstname: e.target.value })
              }
              placeholder='First name'
            />
            <input
              type='text'
              value={editUser.lastname || ''}
              onChange={e =>
                setEditUser({ ...editUser, lastname: e.target.value })
              }
              placeholder='Last name'
            />
            <input
              type='email'
              value={editUser.email || ''}
              onChange={e =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              placeholder='Email'
            />
            <input
              type='text'
              value={editUser.phoneNumber || ''}
              onChange={e =>
                setEditUser({ ...editUser, phoneNumber: e.target.value })
              }
              placeholder='Phone'
            />
            <input
              type='text'
              value={editUser.userCountry || ''}
              onChange={e =>
                setEditUser({ ...editUser, userCountry: e.target.value })
              }
              placeholder='Country'
            />
            <input
              disabled
              type='text'
              value={editUser.password || ''}
              onChange={e =>
                setEditUser({ ...editUser, password: e.target.value })
              }
              placeholder='Password'
            />

            <button className='save-btn' onClick={handleUserUpdate}>
              Save
            </button>

            <h3>Wallets</h3>
            {wallets.map(w => (
              <div key={w._id} className='wallet-card'>
                <p>
                  <strong>{w.symbol}</strong> - ${w.balance.toLocaleString()}
                </p>
                <button
                  onClick={() => handleWalletUpdate(w.userId, w._id, 'add')}
                >
                  + Add
                </button>
                <button
                  onClick={() =>
                    handleWalletUpdate(w.userId, w._id, 'subtract')
                  }
                >
                  - Subtract
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
