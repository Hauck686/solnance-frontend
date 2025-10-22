'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import Input from '../../Components/Layouts/Input'
import Image from 'next/image'
import Head from 'next/head'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async e => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: email.toLowerCase(),
          password
        }
      )

      // save token in localStorage
      localStorage.setItem('authToken', res.data.token)

      toast.success('Login successful!', { position: 'top-right' })

      // redirect based on role (coming from backend response)
      if (res.data.user.role === 'admin') {
        router.push('/admin/AdminDashboard')
      } else {
        router.push('/user/UserDashboard')
      }
    } catch (err) {
      console.error('Login Error:', err)

      if (err.response) {
        const { status, data } = err.response

        if (status === 404) {
          toast.error(data.error || 'User not found')
        } else if (status === 400) {
          toast.error(data.error || 'Invalid password')
        } else if (status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          toast.error(data.error || 'An unexpected error occurred.')
        }
      } else {
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login'>
      {/* Site Head */}
      <Head>
        <title>Login | Solnance</title>
        <meta name='description' content='Login to your Solnance account' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link
          rel='icon'
          href='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
        />
      </Head>

      <ToastContainer />
      <div className='login__container'>
        {/* <Image
          src='https://i.postimg.cc/NjS69Ysh/thurder-Xtorm-logo.png'
          alt='logo'
          className='login__img'
          width={50}
          height={50}
        /> */}
        <p>Login to your account</p>

        <form onSubmit={handleLogin} className='login__form'>
          <Input
            placeholder='Email Address'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            placeholder='Password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <p
            className='login__forgot-text'
            onClick={() => router.push('/auth/ForgotPasswordPage')}
          >
            Forgot password?
          </p>
          <button
            type='submit'
            disabled={loading}
            className='custom-login-button'
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className='register__login-text'>
          Already have an account?{' '}
          <span
            onClick={() => router.push('/auth/RegistrationPage')}
            style={{ color: '#4a90e2', cursor: 'pointer' }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  )
}
