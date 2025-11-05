import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children, role }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex w-full flex-1">
        {/* Sidebar: fixed width on left */}
        <div className="w-64">
          <Sidebar role={role} />
        </div>
        {/* Main content fills remaining space */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout
