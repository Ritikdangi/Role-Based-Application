import React from 'react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  return (
    <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-40 h-16">
      <div className="px-6 h-full flex items-center justify-between pl-64">
        <div />

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{user.name || user.username}</div>
              <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
