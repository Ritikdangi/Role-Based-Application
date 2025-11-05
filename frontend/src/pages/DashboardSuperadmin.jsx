import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Layout from '../components/Layout'

const DashboardSuperadmin = () => {
  const { user, logout, token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [createData, setCreateData] = useState({ name: '', username: '', email: '', adminType: '', institutionName: '' })
  const [createdPassword, setCreatedPassword] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // debug: log auth header and localStorage token to help diagnose 401
      try {
        // eslint-disable-next-line no-console
        console.log('DEBUG: api auth header =', api.defaults.headers.common['Authorization'])
        // eslint-disable-next-line no-console
        console.log('DEBUG: localStorage token =', localStorage.getItem('token'))
      } catch (d) {}
      const res = await api.get('/api/admins/users')
      setUsers(res.data.users || [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for token to be available before fetching users (avoids 401 due to missing header)
    if (!token) return
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreatedPassword(null)
    try {
      const payload = { ...createData }
      const res = await api.post('/api/admins', payload)
      // API returns created admin and plaintext password (for dev)
      setCreatedPassword(res.data.password)
      setCreateData({ name: '', username: '', email: '', adminType: '' })
      await fetchUsers()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create admin')
    } finally {
      setCreating(false)
    }
  }

  const promote = async (id) => {
    if (!confirm('Promote this user to admin?')) return
    try {
      await api.put(`/api/admins/${id}/role`, { role: 'admin' })
      await fetchUsers()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to promote user')
    }
  }

  return (
    <Layout role={user?.role}>
      <div className="p-6">
        <h1 className="text-3xl font-extrabold">System Console</h1>
        <p className="text-sm text-gray-600 mb-4">Create and manage college admins, view users, and global settings.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold mb-2">Create College Admin</h2>
            {error && token && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="w-full p-3 border rounded" placeholder="Full name" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} />
              <input className="w-full p-3 border rounded" placeholder="Username" value={createData.username} onChange={e => setCreateData({ ...createData, username: e.target.value })} />
              <input className="w-full p-3 border rounded" placeholder="Email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} />
              <input className="w-full p-3 border rounded" placeholder="Institution name (e.g. College ABC)" value={createData.institutionName} onChange={e => setCreateData({ ...createData, institutionName: e.target.value })} />
              <select className="w-full p-3 border rounded" value={createData.adminType} onChange={e => setCreateData({ ...createData, adminType: e.target.value })}>
                <option value="">Select admin type (optional)</option>
                <option value="institute">Institute</option>
                <option value="corporate">Corporate</option>
                <option value="school">School</option>
              </select>
              <div>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded" disabled={creating}>{creating ? 'Creating...' : 'Create Admin'}</button>
              </div>
            </form>
            {createdPassword && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <strong>Admin created.</strong>
                <div>Password (deliver securely): <code className="ml-2">{createdPassword}</code></div>
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold mb-2">Users</h2>
            {loading && <div>Loading users...</div>}
            {!loading && users.length === 0 && <div>No users found</div>}
            <ul className="space-y-3 mt-2">
              {users.map(u => (
                <li key={u._id} className="p-3 rounded border flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.name} <span className="text-sm text-gray-500">({u.username})</span></div>
                    <div className="text-sm text-gray-600">{u.email} — <span className="capitalize">{u.role}</span>{u.institution?.name ? ` — ${u.institution.name}` : ''}</div>
                  </div>
                  <div>
                    {u.role === 'user' && <button onClick={() => promote(u._id)} className="px-3 py-1 bg-yellow-600 text-white rounded">Promote</button>}
                    {u.role === 'admin' && <span className="text-sm text-green-600">Admin</span>}
                    {u.role === 'superadmin' && <span className="text-sm text-blue-600">Superadmin</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardSuperadmin
