import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ConfirmModal from '../../components/ConfirmModal'

const ManageUserRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [payload, setPayload] = useState(null)
  const [message, setMessage] = useState(null)
  const [query, setQuery] = useState('')

  const { ready, token } = useAuth()

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admins/requests')
      setRequests(res.data.requests || [])
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    if (!token) return
    fetch()
  }, [ready, token])

  const onApproveClick = (r) => { setPayload({ action: 'approve', id: r._id }); setConfirmOpen(true) }
  const onRejectClick = (r) => { setPayload({ action: 'reject', id: r._id }); setConfirmOpen(true) }

  const doAction = async () => {
    if (!payload) return setConfirmOpen(false)
    try {
      if (payload.action === 'approve') {
        await api.post(`/api/admins/requests/${payload.id}/approve`)
        setMessage('Approved')
      } else {
        await api.post(`/api/admins/requests/${payload.id}/reject`)
        setMessage('Rejected')
      }
      await fetch()
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message)
    } finally {
      setConfirmOpen(false); setPayload(null)
    }
  }

  const filteredRequests = requests.filter(r => {
    if (!query) return true
    const q = query.toLowerCase()
    const roll = r.details?.rollNumber || r.rollNumber || r.user?.rollNumber || r.user?.profile?.rollNumber || ''
    const course = r.details?.course || r.courseName || r.user?.course || r.user?.profile?.course || ''
    return (r.user?.name || '').toLowerCase().includes(q) || roll.toString().toLowerCase().includes(q) || course.toLowerCase().includes(q)
  })

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Manage User Requests</h2>
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Search by name or roll..." value={query} onChange={(e) => setQuery(e.target.value)} className="px-3 py-2 border rounded w-64" />
            <button onClick={fetch} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
          </div>
        </div>

        {message && <div className="mb-3 p-2 bg-yellow-50 text-yellow-800 rounded">{message}</div>}

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRequests.map(r => (
                <tr key={r._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{r.user?.name || r.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.details?.rollNumber || r.rollNumber || r.user?.rollNumber || r.user?.profile?.rollNumber || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.details?.course || r.courseName || r.user?.course || r.user?.profile?.course || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.details?.branch || r.user?.profile?.branch || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => onApproveClick(r)} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Accept</button>
                    <button onClick={() => onRejectClick(r)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          {loading && <div>Loading...</div>}
          {!loading && filteredRequests.length === 0 && <div className="text-gray-600">No pending requests</div>}
        </div>

        <ConfirmModal
          open={confirmOpen}
          title={payload?.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
          message={payload?.action === 'approve' ? 'Approve this join request?' : 'Reject this join request?'}
          onConfirm={doAction}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
  )
}

export default ManageUserRequests
