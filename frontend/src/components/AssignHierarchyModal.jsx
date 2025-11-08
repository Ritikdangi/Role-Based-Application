import React from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const HIERARCHIES = [
  { value: 'management', label: 'Institute Management' },
  { value: 'hod', label: 'HOD' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'alumni', label: 'Alumni' },
]

const AssignHierarchyModal = ({ open, onClose, user, onDone }) => {
  const [selected, setSelected] = React.useState(user?.adminHierarchy || 'alumni')
  const [loading, setLoading] = React.useState(false)
  const { user: me } = useAuth()

  React.useEffect(() => {
    if (user) setSelected(user.adminHierarchy || 'alumni')
  }, [user])

  const handleAssign = async () => {
    if (!user) return
    setLoading(true)
    try {
      // call the new admin endpoint to set hierarchy
      await api.put(`/api/admins/users/${user._id}/hierarchy`, { adminHierarchy: selected })
      if (onDone) onDone()
      onClose()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Assign hierarchy error', err?.response?.data || err.message)
      alert(err?.response?.data?.message || 'Failed to assign hierarchy')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Assign Hierarchy</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">User: <span className="font-medium">{user?.name}</span></div>
          <div className="text-sm text-gray-500">Current: <span className="px-2 py-1 bg-gray-100 rounded text-sm">{user?.adminHierarchy || 'alumni'}</span></div>

          <div className="mt-3">
            {HIERARCHIES.map(h => (
              <label key={h.value} className={`flex items-center p-3 border rounded mb-2 ${selected === h.value ? 'border-orange-400 bg-orange-50' : 'border-gray-100'}`}>
                <input type="radio" name="hierarchy" value={h.value} checked={selected === h.value} onChange={() => setSelected(h.value)} className="mr-3" />
                <div>
                  <div className="font-medium">{h.label}</div>
                  <div className="text-xs text-gray-500">Level {h.value === 'management' ? 1 : h.value === 'hod' ? 2 : h.value === 'faculty' ? 3 : 4}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end mt-4 gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button disabled={loading} onClick={handleAssign} className="px-4 py-2 bg-orange-600 text-white rounded">{loading ? 'Assigning...' : 'Assign'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignHierarchyModal
