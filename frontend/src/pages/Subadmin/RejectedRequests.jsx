import React from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const RejectedRequests = () => {
  const [requests, setRequests] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const { ready, token } = useAuth()

  const fetch = async () => {
    try {
      setLoading(true)
  const res = await api.get('/api/admins/rejected')
      setRequests(res.data.requests || [])
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }
  React.useEffect(() => {
    if (!ready) return
    if (!token) return
    fetch()
  }, [ready, token])

  return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Rejected Requests</h2>
        {loading && <div>Loading...</div>}
        {!loading && requests.length === 0 && <div>No rejected requests</div>}
        {!loading && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r._id} className="p-4 border rounded">
                <div className="font-medium">{r.user?.name || r.user}</div>
                <div className="text-sm text-gray-500">Rejected At: {new Date(r.reviewedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
  )
}

export default RejectedRequests
