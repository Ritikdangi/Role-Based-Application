import React from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import RoleBadge from './RoleBadge'

const HIERARCHY_OPTIONS = [
  { key: 'alumni', label: 'Alumni', level: 4 },
  { key: 'faculty', label: 'Faculty', level: 3 },
  { key: 'hod', label: 'Hod', level: 2 },
  { key: 'institute_management', label: 'Institute Management', level: 1 },
]

const PromoteModal = ({ open, onClose, user, onDone }) => {
  const [selected, setSelected] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState(null)

  React.useEffect(() => {
    if (!open) { setSelected(null); setMessage(null) }
  }, [open])

  const handleGrant = async () => {
    if (!selected) return setMessage('Select a hierarchy')
    try {
      setLoading(true)
      // 1) create a LinkRequest for the user
      const create = await api.post(`/api/links/request/${user._id}`, { requestedHierarchy: selected })
      const lr = create.data.linkRequest
      // 2) attempt to approve immediately (works if current user has permission)
      await api.put(`/api/links/hierarchy/approve/${lr._id}`, { approved: true, newHierarchy: selected })
      setMessage('Granted successfully')
      if (onDone) onDone()
    } catch (err) {
      console.error(err)
      setMessage(err?.response?.data?.message || err.message || 'Failed to grant')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-lg">Grant Hierarchy</div>
            <div className="text-sm text-gray-500">{user?.name} <span className="ml-2">{user?.username}</span></div>
          </div>
          <div onClick={onClose} className="text-gray-400 cursor-pointer">✕</div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">Current: <RoleBadge role={user?.role} hierarchy={user?.adminHierarchy} /></div>
          <div className="grid grid-cols-1 gap-2">
            {HIERARCHY_OPTIONS.map(opt => (
              <motion.button key={opt.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelected(opt.key)} className={`p-3 border rounded text-left ${selected === opt.key ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-gray-500">Level {opt.level}</div>
                  </div>
                  <div>
                    {selected === opt.key ? <span className="text-orange-600 font-semibold">Selected</span> : <span className="text-gray-300">○</span>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {message && <div className="text-sm text-red-600">{message}</div>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button disabled={loading} onClick={handleGrant} className="px-4 py-2 bg-orange-600 text-white rounded">{loading ? 'Granting...' : 'Grant Hierarchy'}</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PromoteModal
