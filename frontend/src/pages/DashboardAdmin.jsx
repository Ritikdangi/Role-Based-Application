import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import RoleBadge from '../components/RoleBadge'
import PromoteModal from '../components/PromoteModal'
import DashboardCharts from '../components/DashboardCharts'

const DashboardAdmin = () => {
  const { user, token, ready, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])
  const [reqLoading, setReqLoading] = useState(false)
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

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
    // Fetch when auth is ready and user is either a college admin or a sub-admin
    // (users with adminHierarchy). This allows HOD/faculty to view institution
    // members and pending requests.
    if (ready && user && token && (user.role === 'admin' || user.adminHierarchy)) {
      fetchUsers()
      fetchRequests()
    }
    // Re-run when user or token changes
  }, [ready, user, token])

  return (
      <div className="p-6">
        <h1 className="text-3xl font-extrabold">College Admin</h1>
        <p className="text-sm text-gray-600 mb-4">Manage your institution members and handle join requests.</p>

        <DashboardCharts />

        {/* Members and Pending Join Requests removed from dashboard - these are available under Manage User Requests */}

        <PromoteModal open={promoteOpen} onClose={() => setPromoteOpen(false)} user={selectedUser} onDone={() => { setPromoteOpen(false); fetchUsers() }} />
      </div>
  )
}

export default DashboardAdmin
