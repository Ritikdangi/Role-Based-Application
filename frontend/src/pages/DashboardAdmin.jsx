import React from 'react'
import { useAuth } from '../context/AuthContext'

import { useEffect, useState } from 'react'
import api from '../services/api'
import Layout from '../components/Layout'

const DashboardAdmin = () => {
  const { user, token, ready, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])
  const [reqLoading, setReqLoading] = useState(false)

  const fetchRequests = async () => {
    setReqLoading(true)
    try {
      const res = await api.get('/api/admins/requests')
      setRequests(res.data.requests || [])
    } catch (err) {
      console.error(err)
    } finally {
      setReqLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admins/institution/users')
      setUsers(res.data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch when the authenticated user is available, is an admin,
    // and we have a token available (prevents race where user is read
    // from localStorage but axios auth header hasn't been applied yet).
    if (ready && user && token && user.role === 'admin') {
      fetchUsers()
      fetchRequests()
    }
    // Re-run when user or token changes
  }, [user, token])

  return (
    <Layout role={user?.role}>
      <div className="p-6">
        <h1 className="text-3xl font-extrabold">College Admin</h1>
        <p className="text-sm text-gray-600 mb-4">Manage your institution members and handle join requests.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold mb-3">Members</h2>
            {loading && <div>Loading...</div>}
            {!loading && users.length === 0 && <div>No users in your institution</div>}
            <ul className="space-y-3 mt-2">
              {users.map(u => (
                <li key={u._id} className="p-3 rounded border flex justify-between items-center">
                  <div>
                    <div className="font-medium">{u.name} <span className="text-sm text-gray-500">({u.username})</span></div>
                    <div className="text-sm text-gray-600">{u.email} — <span className="capitalize">{u.role}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold mb-3">Pending Join Requests</h2>
            {reqLoading && <div>Loading requests...</div>}
            {!reqLoading && requests.length === 0 && <div>No pending requests</div>}
            <ul className="space-y-3 mt-2">
              {requests.map(r => (
                <li key={r._id} className="p-3 rounded border flex justify-between items-start">
                  <div>
                    <div className="font-medium">{r.user.name} <span className="text-sm text-gray-500">({r.user.username})</span></div>
                    <div className="text-sm text-gray-600">{r.user.email}</div>
                    <div className="text-sm text-gray-700 mt-2">Enrollment: {r.details.enrollmentYear} | Branch: {r.details.branch}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={async () => {
                      try {
                        await api.post(`/api/admins/requests/${r._id}/approve`)
                        await fetchRequests()
                        await fetchUsers()
                      } catch (err) {
                        console.error('Approve error', err)
                        alert(err.response?.data?.message || 'Failed to approve')
                      }
                    }} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                    <button onClick={async () => {
                      try {
                        await api.post(`/api/admins/requests/${r._id}/reject`)
                        await fetchRequests()
                      } catch (err) {
                        console.error('Reject error', err)
                        alert(err.response?.data?.message || 'Failed to reject')
                      }
                    }} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardAdmin
