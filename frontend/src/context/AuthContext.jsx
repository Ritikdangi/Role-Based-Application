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

  // Poll for hierarchy updates so a user who gets promoted while logged in
  // will see the change reflected in the UI within a short time window.
  useEffect(() => {
    let timer = null
    let mounted = true
    const poll = async () => {
      if (!token || !mounted) return
      try {
        const res = await api.get('/api/links/hierarchy/my-hierarchy')
        const newHierarchy = res.data?.adminHierarchy || null
        if (newHierarchy && mounted) {
          setUser(prev => {
            const updated = { ...(prev || {}), adminHierarchy: newHierarchy }
            localStorage.setItem('auth', JSON.stringify({ user: updated }))
            return updated
          })
        }
      } catch (err) {
        // ignore polling errors silently
      }
    }
    if (token) {
      // start polling every 10 seconds
      timer = setInterval(poll, 10000)
      // also run immediately once
      poll()
    }
    return () => { mounted = false; if (timer) clearInterval(timer) }
  }, [token])

  const fetchMe = async () => {
    // Prevent concurrent fetches: if a fetch is already in progress, return its promise
    if (fetchMe._inFlight) return fetchMe._inFlight
    fetchMe._inFlight = (async () => {
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data.user)
        localStorage.setItem('auth', JSON.stringify({ user: res.data.user }))
        return res.data.user
      } catch (err) {
        // Only clear token on explicit 401 (unauthorized). Network errors or other failures
        // should not clear token automatically to avoid tight re-try loops.
        const status = err?.response?.status
        if (status === 401) {
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
          localStorage.removeItem('auth')
        }
        return null
      } finally {
        // clear in-flight marker
        fetchMe._inFlight = null
      }
    })()
    return fetchMe._inFlight
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
