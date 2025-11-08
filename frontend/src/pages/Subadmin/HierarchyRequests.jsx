import React from 'react'
import api from '../../services/api'
import ConfirmModal from '../../components/ConfirmModal'

const PAGE_SIZE = 10

const HierarchyRequests = () => {
  const [requests, setRequests] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [message, setMessage] = React.useState(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmPayload, setConfirmPayload] = React.useState(null)
  const [page, setPage] = React.useState(1)

  const fetchRequests = async () => {
    try {
      setLoading(true)
    const res = await api.get('/api/links/hierarchy/requests')
      setRequests(res.data.requests || [])
    } catch (err) {
      setError(err?.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchRequests() }, [])

  const doApprove = async (id, requestedHierarchy) => {
    try {
  await api.put(`/api/links/hierarchy/approve/${id}`, { approved: true, newHierarchy: requestedHierarchy })
      await fetchRequests()
      setMessage('Approved')
    } catch (err) {
      setMessage('Approve failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  const doReject = async (id) => {
    try {
  await api.put(`/api/links/hierarchy/approve/${id}`, { approved: false, newHierarchy: null })
      await fetchRequests()
      setMessage('Rejected')
    } catch (err) {
      setMessage('Reject failed: ' + (err?.response?.data?.message || err.message))
    }
  }

  const onApproveClick = (r) => {
    setConfirmPayload({ action: 'approve', id: r._id, requestedHierarchy: r.requestedHierarchy })
    setConfirmOpen(true)
  }

  const onRejectClick = (r) => {
    setConfirmPayload({ action: 'reject', id: r._id })
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirmPayload) return setConfirmOpen(false)
    const { action, id, requestedHierarchy } = confirmPayload
    setConfirmOpen(false)
    if (action === 'approve') await doApprove(id, requestedHierarchy)
    if (action === 'reject') await doReject(id)
    setConfirmPayload(null)
  }

  const total = requests.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const shown = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Hierarchy Requests</h2>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{JSON.stringify(error)}</div>}
      {!loading && requests.length === 0 && <div>No pending requests</div>}

      {!loading && requests.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="p-3">Sender</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.sender?.name || r.sender}</td>
                  <td className="p-3">{r.requestedHierarchy}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button onClick={() => onApproveClick(r)} className="px-3 py-1 bg-green-500 text-white rounded mr-2">Approve</button>
                    <button onClick={() => onRejectClick(r)} className="px-3 py-1 bg-red-400 text-white rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">Showing {shown.length} of {total}</div>
            <div className="space-x-2">
              <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
              <span className="text-sm">Page {page} / {pages}</span>
              <button disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title={confirmPayload?.action === 'approve' ? 'Approve request' : 'Reject request'}
        message={confirmPayload?.action === 'approve' ? 'Are you sure you want to approve this hierarchy request?' : 'Are you sure you want to reject this hierarchy request?'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default HierarchyRequests
