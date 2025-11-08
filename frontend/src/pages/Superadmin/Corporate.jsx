import React, { useEffect, useState } from 'react'
import api from '../../services/api'

const Corporate = () => {
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState([])
  const [error, setError] = useState(null)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admins/users')
      const users = res.data.users || []
      const corporateAdmins = users.filter(u => u.adminType === 'corporate')
      setAdmins(corporateAdmins)
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Corporate</h1>
      <p className="text-sm text-gray-600 mb-4">List of corporate admins and partners.</p>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
            )}
            {!loading && admins.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-600">No corporate admins found.</td></tr>
            )}
            {!loading && admins.map(u => (
              <tr key={u._id}>
                <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.institution?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Corporate
