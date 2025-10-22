'use client'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { saveUserIdHash } from './UnHashedUserId'

const PrivateRoute = ({ children }) => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async url => {
    try {
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken')
      }
      if (!token) {
        router.replace('/auth/Login')
        return
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/getMe`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const { userId, role } = res.data
      const path = url || router.pathname

      // route-based role redirects
      if (path.startsWith('/admin') && role !== 'admin') {
        router.replace('/user/UserDashboard')
        return
      }
      if (path.startsWith('/user') && role === 'admin') {
        router.replace('/admin/AdminDashboard')
        return
      }

      await saveUserIdHash(userId)
      setAuthorized(true)
    } catch (err) {
      console.error('Auth check failed:', err)
      setAuthorized(false)
      router.replace('/auth/Login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    const handleRouteChange = url => {
      setLoading(true)
      setAuthorized(false)
      checkAuth(url)
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!authorized) return null

  return <>{children}</>
}

export default PrivateRoute
