import React from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const DashboardCharts = ({ scope = 'institution' }) => {
  const [data, setData] = React.useState(null)
  const { ready, token } = useAuth()

  React.useEffect(() => {
    // Wait for auth ready/token so protected endpoints return user lists
    if (!ready || !token) return
    const load = async () => {
      try {
        const url = scope === 'institution' ? '/api/admins/institution/users' : '/api/admins/users'
        const res = await api.get(url)
        const users = res.data.users || []
        const counts = { alumni: 0, faculty: 0, hod: 0, management: 0 }
        users.forEach(u => {
          const h = (u.adminHierarchy || '').toString().toLowerCase()
          if (h.includes('management')) counts.management += 1
          else if (h.includes('hod')) counts.hod += 1
          else if (h.includes('faculty')) counts.faculty += 1
          else counts.alumni += 1
        })
        setData(counts)
      } catch (err) {
        console.error('Charts load', err)
      }
    }
    load()
  }, [scope, ready, token])

  if (!data) return <div className="p-4">Loading charts...</div>

  const donut = {
    labels: ['Management', 'HOD', 'Faculty', 'Alumni'],
    datasets: [{ data: [data.management, data.hod, data.faculty, data.alumni], backgroundColor: ['#F59E0B', '#7C3AED', '#4F46E5', '#94A3B8'] }]
  }

  const donutOptions = {
    maintainAspectRatio: false,
    cutout: '60%', // make the inner cutout larger so the visible ring is thinner
    plugins: {
      legend: { position: 'top' }
    }
  }

  const bar = {
    labels: ['Management', 'HOD', 'Faculty', 'Alumni'],
    datasets: [{ label: 'Count', data: [data.management, data.hod, data.faculty, data.alumni], backgroundColor: '#FB923C' }]
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-semibold mb-2">Hierarchy distribution</h3>
        <div className="w-full h-56">{/* constrain height so doughnut appears smaller */}
          <Doughnut data={donut} options={donutOptions} />
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-sm font-semibold mb-2">Activity / Counts</h3>
        <Bar data={bar} />
      </div>
    </div>
  )
}

export default DashboardCharts
