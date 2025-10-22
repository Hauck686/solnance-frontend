'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // check session on app load
  useEffect(() => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyToken`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken')
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      { email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    setUser(res.data.user)
    return res.data.user
  }

  const handleLogout = async () => {
    try {
      // Remove local session
      localStorage.removeItem('authToken')
      localStorage.removeItem('userIdHash')

      // Notify backend (optional)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Redirect
      window.location.href = '/auth/Login'
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/auth/Login' // still force redirect
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
