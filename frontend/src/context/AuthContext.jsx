import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth')
      return raw ? JSON.parse(raw).user : null
    } catch (e) {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // refresh current user data
        await fetchMe()
      } else {
        delete api.defaults.headers.common['Authorization']
        setUser(null)
      }
      if (mounted) setReady(true)
    }
    init()
    return () => { mounted = false }
  }, [token])

  const fetchMe = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data.user)
      localStorage.setItem('auth', JSON.stringify({ user: res.data.user }))
      return res.data.user
    } catch (err) {
      // token may be invalid/expired
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('auth')
      return null
    }
  }

  const login = ({ user, token }) => {
    // Set axios auth header synchronously to avoid race where other
    // components fire protected requests before the effect runs.
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setUser(user)
    setToken(token)
    localStorage.setItem('token', token)
    localStorage.setItem('auth', JSON.stringify({ user }))
  }


  const logout = () => {
    setUser(null)
    setToken(null)
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export const useAuthGuard = () => {
  const { user } = useAuth()
  return !!user
}
