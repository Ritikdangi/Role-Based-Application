import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const AddAdmin = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [createData, setCreateData] = useState({ name: '', username: '', email: '', adminType: '', institutionName: '' })
  const [createdPassword, setCreatedPassword] = useState(null)
  const navigate = useNavigate()

  const fetchUsers = async () => {
    // no-op: users are displayed on their respective pages
  }

  useEffect(() => {
    // keep effect placeholder if needed in future
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreatedPassword(null)
    try {
      const payload = { ...createData }
      const res = await api.post('/api/admins', payload)
      // API returns created admin and plaintext password (for dev)
      setCreatedPassword(res.data.password)
      setCreateData({ name: '', username: '', email: '', adminType: '', institutionName: '' })
      // navigate to the related admin type page so the new admin is visible in context
      const type = (payload.adminType || 'institute')
      if (type === 'institute') navigate('/superadmin/institutes')
      else if (type === 'corporate') navigate('/superadmin/corporate')
      else if (type === 'school') navigate('/superadmin/school')
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
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Add New Admin</h1>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2">Create College Admin</h2>
          {error && token && <div className="text-red-600 mb-2">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-3">
            <input className="w-full p-3 border rounded" placeholder="Full name" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} />
            <input className="w-full p-3 border rounded" placeholder="Username" value={createData.username} onChange={e => setCreateData({ ...createData, username: e.target.value })} />
            <input className="w-full p-3 border rounded" placeholder="Email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} />
            <input className="w-full p-3 border rounded" placeholder="Institution name (e.g. College ABC)" value={createData.institutionName} onChange={e => setCreateData({ ...createData, institutionName: e.target.value })} />
            <select className="w-full p-3 border rounded" value={createData.adminType} onChange={e => setCreateData({ ...createData, adminType: e.target.value })}>
              <option value="">Select admin type</option>
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
      </div>
  )
}

export default AddAdmin
