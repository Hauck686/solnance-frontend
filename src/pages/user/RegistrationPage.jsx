'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const countries = [
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'GH', name: 'Ghana', dial: '+233' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' }
]

export default function RegistrationPage () {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    dialCode: '',
    referralCode: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const refFromURL = router.query.ref
    if (refFromURL) {
      setForm(prev => ({ ...prev, referralCode: refFromURL }))
    }
  }, [router.query.ref])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = e => {
    const selected = countries.find(c => c.name === e.target.value)
    setForm(prev => ({
      ...prev,
      country: selected?.name || '',
      dialCode: selected?.dial || ''
    }))
  }

  const validateEmail = email =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)

  const validatePhoneNumber = phone => /^(\+?\d{10,14})$/.test(phone)

  const validatePassword = password =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)

  const handleRegister = async e => {
    e.preventDefault()
    const {
      firstName,
      lastName,
      email,
      phone,
      referralCode,
      password,
      confirmPassword,
      dialCode,
      country
    } = form

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !country
    ) {
      toast.error('Please fill in all fields')
      return
    }

    if (!validateEmail(email)) {
      toast.error('Invalid email format')
      return
    }

    if (!validatePhoneNumber(phone)) {
      toast.error('Phone number must be 11 digits')
      return
    }

    if (!validatePassword(password)) {
      toast.error(
        'Password must contain 8+ chars, upper & lowercase, number & special char'
      )
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Normalize Nigerian phone numbers
    let normalizedPhone = phone
    if (dialCode === '+234' && phone.startsWith('0')) {
      normalizedPhone = phone.substring(1)
    }

    const userData = {
      firstname: firstName.toLowerCase(),
      surname: lastName.toLowerCase(),
      email: email.toLowerCase(),
      referralCode: referralCode,
      password,
      phoneNumber: normalizedPhone,
      userCountry: country
    }

    setLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success('Registration successful!')
      setTimeout(() => router.push('/auth/Login'), 2000)
    } catch (err) {
      console.error('Registration error:', err)

      // ✅ Extract exact error message
      let errorMsg = 'Something went wrong!'
      if (err.response) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message
        } else if (err.response.data?.error) {
          errorMsg = err.response.data.error
        } else {
          errorMsg = JSON.stringify(err.response.data)
        }
      } else if (err.request) {
        errorMsg = 'No response from server. Please try again.'
      } else if (err.message) {
        errorMsg = err.message
      }

      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={'authWrapper'}>
      <ToastContainer />
      <div className={'formCard'}>
        <h2>Sign Up</h2>
        <p>Create an account with Solnance</p>

        <form onSubmit={handleRegister} className={'form'}>
          <div className={'formRow'}>
            <input
              type='text'
              name='firstName'
              placeholder='First Name'
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              type='text'
              name='lastName'
              placeholder='Last Name'
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
          />

          <input
            type='tel'
            name='phone'
            placeholder='Mobile Number'
            value={form.phone}
            onChange={handleChange}
          />
          <input
            type='text'
            name='referralCode'
            placeholder='Referral Code'
            value={form.referralCode}
            onChange={handleChange}
          />

          <select
            name='country'
            value={form.country}
            onChange={handleCountryChange}
          >
            <option value=''>Select Country</option>
            {countries.map(c => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type='password'
            name='password'
            placeholder='Password'
            value={form.password}
            onChange={handleChange}
          />

          <input
            type='password'
            name='confirmPassword'
            placeholder='Confirm Password'
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button type='submit' disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* <div className={'altLogin'}>
            <p>Or Sign Up with</p>
            <div className={'socialIcons'}>
              <span>🔵</span>
              <span>🔗</span>
              <span>🔴</span>
            </div>
          </div> */}

          <p className={'loginLink'}>
            Already have an account?{' '}
            <span onClick={() => router.push('/auth/Login')}>Sign In</span>
          </p>
        </form>
      </div>

      <div className={'graphicPanel'}>
        <div className={'glowCircle'} />
        <div className={'ethGraphic'} />
      </div>
    </div>
  )
}
