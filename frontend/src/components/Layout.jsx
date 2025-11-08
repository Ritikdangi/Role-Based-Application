import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const { user } = useAuth()
  // Pass role from context to Sidebar to avoid prop flicker when pages re-render
  const role = user?.role

  return (
    // add top padding so fixed header does not overlap content
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
      <Header />
      <div className="flex w-full flex-1">
        {/* Sidebar: fixed width on left */}
        <div className="w-64">
          <Sidebar role={role} />
        </div>
        {/* Main content fills remaining space; limit height so it scrolls independently while header/sidebar stay fixed */}
        <main className="flex-1 p-6 overflow-auto h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  )
}

export default Layout
