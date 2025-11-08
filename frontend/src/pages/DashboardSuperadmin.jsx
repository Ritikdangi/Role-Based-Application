import React from 'react'
import DashboardCharts from '../components/DashboardCharts'

const DashboardSuperadmin = () => {
  return (
      <div className="p-6">
        <h1 className="text-3xl font-extrabold">System Console</h1>
        <p className="text-sm text-gray-600 mb-4">Global overview and system analytics.</p>
        <DashboardCharts scope="global" />
      </div>
  )
}

export default DashboardSuperadmin
