import React, { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Input from '../../Components/Layouts/Input'
import Image from 'next/image'
import Head from 'next/head'

export default function ForgotPasswordPage () {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOTP = async e => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter a valid email!')

    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
        email: email.trim().toLowerCase()
      })
      toast.success('OTP Sent! Check your email.')
      setStep(2)
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async e => {
    e.preventDefault()
    if (!otp.trim()) return toast.error('Enter the OTP!')

    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        email: email.toLowerCase(),
        otp
      })
      toast.success('OTP Verified! Set new password')
      setStep(3)
    } catch (err) {
      //(email, otp)
      toast.error('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async e => {
    e.preventDefault()
    if (!newPassword.trim()) return toast.error('Enter a new password!')

    setLoading(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          email: email.toLowerCase(),
          newPassword
        }
      )
      toast.success('Password updated successfully!')
      setTimeout(() => {
        router.replace('/auth/Login')
      }, 2000)
    } catch (err) {
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login'>
      <Head>
        <title>Forgot Password | Solnance</title>
        <meta
          name='description'
          content='Forgot your Solnance account password?'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link
          rel='icon'
          href='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
        />
      </Head>

      <ToastContainer />
      <div className='login__container'>
        <Image
          src='https://i.postimg.cc/V6f00jhs/Crypt-Logo-Retina.webp'
          alt='logo'
          className='login__img'
          width={50}
          height={50}
        />
        <h3 className='login__head'>
          {step === 1
            ? 'Enter Email'
            : step === 2
            ? 'Verify OTP'
            : 'Set New Password'}
        </h3>

        <form className='login__form'>
          {step === 1 && (
            <>
              <Input
                placeholder='Email Address'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button
                onClick={handleSendOTP}
                type='button'
                disabled={loading}
                className='custom-login-button'
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                placeholder='Enter OTP'
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOTP}
                type='button'
                disabled={loading}
                className='custom-login-button'
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <Input
                placeholder='New Password'
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button
                onClick={handleResetPassword}
                type='button'
                disabled={loading}
                className='custom-login-button'
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
        </form>

        <p className='register__login-text'>
          Back to{' '}
          <span
            onClick={() => router.push('/auth/Login')}
            style={{ color: '#4a90e2', cursor: 'pointer' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}
