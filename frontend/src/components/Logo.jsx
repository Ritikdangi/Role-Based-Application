import React from 'react'

const Logo = ({ size = 36 }) => (
  <div className="flex items-center gap-2">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#FF7A18" />
      <path d="M6 15V9a6 6 0 0112 0v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="2" fill="white" />
    </svg>
    <div className="leading-tight">
      <div className="text-lg font-bold text-gray-900">CareerNest</div>
      <div className="text-xs text-orange-600">Alumni & Career Network</div>
    </div>
  </div>
)

export default Logo
