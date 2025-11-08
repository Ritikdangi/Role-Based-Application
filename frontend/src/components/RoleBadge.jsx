import React from 'react'

const COLORS = {
  superadmin: 'bg-blue-100 text-blue-800',
  admin: 'bg-green-100 text-green-800',
  hod: 'bg-purple-100 text-purple-800',
  faculty: 'bg-indigo-100 text-indigo-800',
  management: 'bg-yellow-100 text-yellow-800',
  alumni: 'bg-gray-100 text-gray-700',
}

const RoleBadge = ({ role, hierarchy }) => {
  const key = (hierarchy || role || '').toString().toLowerCase()
  const cls = COLORS[key] || 'bg-gray-100 text-gray-700'
  const label = hierarchy ? hierarchy.toString().replace(/_/g, ' ') : role
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label?.toString?.()}
    </span>
  )
}

export default RoleBadge
