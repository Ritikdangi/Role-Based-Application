import React from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'
import { getHierarchyLevel } from '../utils/accessControl'
import { useAuth } from '../context/AuthContext'

const SubAdminProtectedRoute = ({ children, minLevel = 3 }) => {
  const { user, ready } = useAuth()
  const [allowed, setAllowed] = React.useState(null)

  React.useEffect(() => {
    let mounted = true
    const check = async () => {
      if (!ready) return // wait until auth ready
      if (!user) return setAllowed(false)
      try {
  const res = await api.get('/api/links/hierarchy/my-hierarchy')
        const h = res.data?.adminHierarchy || user.adminHierarchy || null
        const lvl = getHierarchyLevel(h)
        if (mounted) setAllowed(lvl <= minLevel)
      } catch (err) {
        // if error, fallback to user's stored adminHierarchy
        const lvl = getHierarchyLevel(user.adminHierarchy || null)
        if (mounted) setAllowed(lvl <= minLevel)
      }
    }
    check()
    return () => { mounted = false }
  }, [user, minLevel, ready])

  if (allowed === null) return <div className="p-6">Checking permissions...</div>
  if (!allowed) return <Navigate to="/login" replace />
  return children
}

export default SubAdminProtectedRoute
