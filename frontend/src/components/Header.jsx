import React from 'react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  return (
    <header className="w-full bg-white border-b shadow-sm">
  <div className="px-6 py-3 flex items-center justify-between" style={{ paddingLeft: '16rem' }}>
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
