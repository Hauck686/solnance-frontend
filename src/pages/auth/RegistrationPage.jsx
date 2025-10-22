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
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'IT', name: 'Italy', dial: '+39' },
  { code: 'ES', name: 'Spain', dial: '+34' },
  { code: 'NL', name: 'Netherlands', dial: '+31' },
  { code: 'BE', name: 'Belgium', dial: '+32' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'SE', name: 'Sweden', dial: '+46' },
  { code: 'NO', name: 'Norway', dial: '+47' },
  { code: 'DK', name: 'Denmark', dial: '+45' },
  { code: 'FI', name: 'Finland', dial: '+358' },
  { code: 'IE', name: 'Ireland', dial: '+353' },
  { code: 'PT', name: 'Portugal', dial: '+351' },
  { code: 'PL', name: 'Poland', dial: '+48' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'GR', name: 'Greece', dial: '+30' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'KR', name: 'South Korea', dial: '+82' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'QA', name: 'Qatar', dial: '+974' },
  { code: 'KW', name: 'Kuwait', dial: '+965' },
  { code: 'OM', name: 'Oman', dial: '+968' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'MA', name: 'Morocco', dial: '+212' },
  { code: 'DZ', name: 'Algeria', dial: '+213' },
  { code: 'ET', name: 'Ethiopia', dial: '+251' },
  { code: 'TZ', name: 'Tanzania', dial: '+255' },
  { code: 'UG', name: 'Uganda', dial: '+256' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263' },
  { code: 'AR', name: 'Argentina', dial: '+54' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'CL', name: 'Chile', dial: '+56' },
  { code: 'CO', name: 'Colombia', dial: '+57' }
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
        userData
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
        <form onSubmit={handleRegister} className={'form'}>
          <p>Create an account</p>

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
