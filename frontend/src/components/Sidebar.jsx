import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo'
import api from '../services/api'
import { getAccessibleNavItems } from '../utils/accessControl'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ role }) => {
  const common = [
    { to: '/', label: 'Home' },
    { to: '/profile', label: 'Profile' },
    { to: '/posts', label: 'Posts' },
    { to: '/internships', label: 'Internships' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/events', label: 'Events' },
    { to: '/network', label: 'Join Network' },
  ]
  const userLinks = [
    { to: '/user/dashboard', label: 'Dashboard' },
    { to: '/user/profile', label: 'Profile' },
    { to: '/user/network', label: 'Network' },
    { to: '/user/posts', label: 'Posts' },
    { to: '/user/internships', label: 'Internships' },
    { to: '/user/jobs', label: 'Jobs' },
    { to: '/user/events', label: 'Events' },
  ]
  const adminLinks = [
    // Admin menu in legacy order requested by user
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/requests', label: 'Manage User Requests' },
  { to: '/admin/manage-alumni', label: 'Manage Alumni' },
    { to: '/admin/rejected-requests', label: 'Rejected Requests' },
    { to: '/admin/make-post', label: 'Make Post' },
    { to: '/admin/admin-posts', label: 'Admin Posts' },
    { to: '/admin/rejected-posts', label: 'Rejected Posts' },
    { to: '/admin/post-request', label: 'Post Request' },
    { to: '/admin/build-profile', label: 'Build Admin Profile' },
    // footer/branding removed for admin sidebar (duplicate)
  ]
  const superLinks = [
    { to: '/superadmin/dashboard', label: 'Home' },
    // for superadmin, route profile under the superadmin shell so Layout remains mounted
    { to: '/superadmin/profile', label: 'Profile' },
    { to: '/superadmin/institutes', label: 'Institutes' },
    { to: '/superadmin/corporate', label: 'Corporate' },
    { to: '/superadmin/school', label: 'School' },
    { to: '/superadmin/add-admin', label: 'Add New Admin' },
  ]

  let links = []
  // We'll use effectiveRole (prop or from auth or localStorage) to decide which links to show
  const { ready, token, user } = useAuth()
  const storedRole = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('auth'))?.user?.role } catch (e) { return null }
  }, [])

  // Determine admin vs subadmin vs superuser
  const isAdminLike = !!(role === 'admin' || user?.role === 'admin' || storedRole === 'admin')
  const isSubadmin = !!(user?.adminHierarchy)
  const effectiveRole = isAdminLike ? 'admin' : (isSubadmin ? 'subadmin' : (role || user?.role || storedRole))

  if (effectiveRole === 'admin') {
    // admin: use hierarchy-aware nav (fetch effective hierarchy from API if available)
    links = adminLinks
  } else if (effectiveRole === 'superadmin') {
    // For superadmin we show a focused, ordered set of items where Home maps
    // to the superadmin dashboard overview (not the regular user home)
    links = superLinks
  } else {
    // default/user: present an ordered, focused menu for regular users
    links = userLinks
  }

  // If this is an institutional admin, try to fetch the effective hierarchy and use the access control helper
  const [hierarchyNav, setHierarchyNav] = React.useState(null)
  const [loadingHierarchy, setLoadingHierarchy] = React.useState(false)

  React.useEffect(() => {
    // Wait for auth to be ready and token to be applied before calling protected APIs
    let mounted = true
    const load = async () => {
      if ((effectiveRole === 'admin' || effectiveRole === 'subadmin') && ready && token) {
        setLoadingHierarchy(true)
        try {
          // If user already has adminHierarchy in their profile, use it to compute nav immediately
            if (user?.adminHierarchy) {
              const items = getAccessibleNavItems(user.adminHierarchy)
              if (mounted) setHierarchyNav(items)
            }
            // still attempt to fetch authoritative effective hierarchy from API
            const res = await api.get('/api/links/hierarchy/my-hierarchy')
            const h = res.data?.adminHierarchy || null
            const items2 = getAccessibleNavItems(h)
            if (mounted && Array.isArray(items2) && items2.length > 0) setHierarchyNav(items2)
        } catch (err) {
          // log error for debugging
          // eslint-disable-next-line no-console
          console.error('Sidebar: failed to load hierarchy', err?.response?.status, err?.message)
          if (mounted) setHierarchyNav(null)
        } finally {
          if (mounted) setLoadingHierarchy(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [effectiveRole, ready, token])

  if (Array.isArray(hierarchyNav) && hierarchyNav.length > 0 && (effectiveRole === 'admin' || effectiveRole === 'subadmin')) {
    // convert to the same simple shape used by this component
    links = hierarchyNav.map(i => ({ to: i.url, label: i.title }))
  }

  // Debug: log effective state so we can see why sidebar might be empty
  // eslint-disable-next-line no-console
  console.debug('Sidebar state', { effectiveRole, ready, token: !!token, loadingHierarchy, linksCount: links.length, hierarchyNav })

  // Icons removed: user requested no icons on sidebar items for a cleaner look.

  return (
    <aside className="bg-gradient-to-b from-white to-orange-50 border-r h-[calc(100vh-64px)] sticky top-16 overflow-auto">
      <div className="p-6 border-b">
        <Logo />
      </div>
      <nav className="mt-6 px-2 flex-1">
        {/* show skeleton placeholders while hierarchy is being determined to avoid sidebar vanishing */}
        {loadingHierarchy && (
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        )}

        {/* Always render links (fallback to adminLinks/userLinks) to avoid empty sidebar while loading */}
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded mb-1 text-sm ${isActive ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
  <div className="mt-auto p-4 text-xs text-gray-500">CareerNest • Alumni & Career Network</div>
    </aside>
  )
}

export default Sidebar
