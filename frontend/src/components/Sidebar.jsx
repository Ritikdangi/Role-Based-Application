import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo'

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
    { to: '/profile', label: 'Profile' },
    { to: '/network', label: 'Network' },
    { to: '/posts', label: 'Posts' },
    { to: '/internships', label: 'Internships' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/events', label: 'Events' },
  ]
  const adminLinks = [
    // Order specifically for admin as requested: Admin Dashboard, Profile, Requests, Users, Posts, Internships, Jobs, Events
    { to: '/admin/dashboard', label: 'Admin Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/admin/requests', label: 'Requests' },
    { to: '/admin/users', label: 'Users' },
    { to: '/posts', label: 'Posts' },
    { to: '/internships', label: 'Internships' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/events', label: 'Events' },
  ]
  const superLinks = [
    { to: '/superadmin/dashboard', label: 'Home' },
    { to: '/profile', label: 'Profile' },
    { to: '/superadmin/institutes', label: 'Institutes' },
    { to: '/superadmin/corporate', label: 'Corporate' },
    { to: '/superadmin/school', label: 'School' },
    { to: '/superadmin/add-admin', label: 'Add New Admin' },
  ]

  let links = []
  if (role === 'admin') {
    // admin gets a custom ordered set (no Home / Join Network)
    links = adminLinks
  } else if (role === 'superadmin') {
    // For superadmin we show a focused, ordered set of items where Home maps
    // to the superadmin dashboard overview (not the regular user home)
    links = superLinks
  } else {
    // default/user: present an ordered, focused menu for regular users
    links = userLinks
  }

  return (
    <aside className="min-h-screen bg-gradient-to-b from-white to-orange-50 border-r">
      <div className="p-6 border-b">
        <Logo />
      </div>
      <nav className="mt-6 px-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-4 py-3 rounded mb-1 text-sm ${isActive ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
  <div className="mt-auto p-4 text-xs text-gray-500">CareerNest • Alumni & Career Network</div>
    </aside>
  )
}

export default Sidebar
