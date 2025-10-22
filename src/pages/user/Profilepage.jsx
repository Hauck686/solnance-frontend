'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  FaUserEdit,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaSave
} from 'react-icons/fa'
import Image from 'next/image'

import { toast } from 'react-toastify'
import { getVerifiedUserId } from '../../context/UnHashedUserId'

export default function ProfilePage () {
  const [profile, setProfile] = useState({
    userId: '',
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    userCountry: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const UserId = await getVerifiedUserId()
        let token = null
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken')
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${UserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const user = res.data.user

        setProfile({
          userId: UserId,
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          userCountry: user.userCountry || ''
        })
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch profile')
      }
    }

    fetchUser()
  }, [])

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success('Profile updated!')
    } catch (err) {
      console.error(err)
      toast.error('Update failed')
    }
  }

  return (
    <div className='page'>
      <div className='profile-page'>
        <div className='profile-card'>
          <div className='profile-avatar'>
            <Image
              src='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
              alt='User Avatar'
              width={150}
              height={100}
            />
            <h2>
              {profile.firstname} {profile.lastname}
            </h2>
            <p>ID: {profile.userId}</p>
          </div>

          <div className='profile-fields'>
            <div className='field'>
              <FaUserEdit />
              <input
                type='text'
                name='firstname'
                placeholder='First Name'
                value={profile.firstname}
                onChange={handleChange}
              />
            </div>
            <div className='field'>
              <FaUserEdit />
              <input
                type='text'
                name='lastname'
                placeholder='Last Name'
                value={profile.lastname}
                onChange={handleChange}
              />
            </div>
            <div className='field'>
              <FaEnvelope />
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={profile.email}
                onChange={handleChange}
              />
            </div>
            <div className='field'>
              <FaPhone />
              <input
                type='text'
                name='phoneNumber'
                placeholder='Phone Number'
                value={profile.phoneNumber}
                onChange={handleChange}
                maxLength={11}
              />
            </div>
            <div className='field'>
              <FaGlobe />
              <input
                type='text'
                name='userCountry'
                placeholder='Country'
                value={profile.userCountry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='profile-actions'>
            <button className='update-btn' onClick={handleSubmit}>
              <FaSave />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
