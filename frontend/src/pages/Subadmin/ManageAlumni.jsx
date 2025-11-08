import React from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AssignHierarchyModal from '../../components/AssignHierarchyModal'
import { getHierarchyLevel, HIERARCHY_LEVELS } from '../../utils/accessControl'

const ManageAlumni = () => {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState(null)

  const { ready, token, user } = useAuth()
  const myLevel = getHierarchyLevel(user?.adminHierarchy)

  const fetch = async () => {
    try {
      setLoading(true)
  const res = await api.get('/api/admins/institution/users')
      setUsers(res.data.users || [])
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }
  React.useEffect(() => {
    if (!ready) return
    if (!token) return
    fetch()
  }, [ready, token])

  return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Managed Alumni</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && users.length === 0 && <div>No alumni found for your institution</div>}
        {!loading && users.length > 0 && (
          <div className="space-y-3">
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hierarchy</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.adminHierarchy || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {(user?.role === 'admin' || myLevel === HIERARCHY_LEVELS.MANAGEMENT) && (
                          <button onClick={() => { setSelectedUser(u); setAssignOpen(true) }} className="px-3 py-1 bg-blue-600 text-white rounded">Assign Hierarchy</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AssignHierarchyModal open={assignOpen} onClose={() => setAssignOpen(false)} user={selectedUser} onDone={() => { setAssignOpen(false); fetch() }} />
      </div>
  )
}

export default ManageAlumni
