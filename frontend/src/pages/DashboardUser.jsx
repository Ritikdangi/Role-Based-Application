import React from 'react'
import { useAuth } from '../context/AuthContext'

import { useEffect, useState } from 'react'
import api from '../services/api'


const DashboardUser = () => {
  const { user, logout, fetchMe } = useAuth()
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(false)
  const [joinMsg, setJoinMsg] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestData, setRequestData] = useState({ enrollmentYear: '', branch: '', rollNumber: '', course: '', collegeEmail: '' })

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/institutions')
        setInstitutions(res.data.institutions || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
    // also fetch user's own requests so they persist on refresh
    const fetchMyRequests = async () => {
      try {
        const r = await api.get('/api/institutions/requests')
        setJoinMsg('')
        const pending = (r.data.requests || []).filter(x => x.status === 'pending')
        if (pending.length) setJoinMsg(`You have ${pending.length} pending request(s)`)
      } catch (e) {
        // ignore silently
      }
    }
    fetchMyRequests()
  }, [])

  // Poll for join approval: when user has a pending request, poll fetchMe until institution is set
  useEffect(() => {
    let poll
    const startPolling = () => {
      let attempts = 0
      poll = setInterval(async () => {
        attempts += 1
        try {
          if (fetchMe) {
            const refreshed = await fetchMe()
            if (refreshed && refreshed.institution) {
              setJoinMsg('Your request was approved — you have joined the network: ' + (refreshed.institution.name || ''))
              clearInterval(poll)
            }
          }
        } catch (e) {
          // ignore
        }
        if (attempts > 24) { // stop after ~2 minutes
          clearInterval(poll)
        }
      }, 5000)
    }

    // start polling only if user has pending requests
    const checkPending = async () => {
      try {
        const r = await api.get('/api/institutions/requests')
        const pending = (r.data.requests || []).filter(x => x.status === 'pending')
        if (pending.length) startPolling()
      } catch (e) {}
    }
    checkPending()

    return () => { if (poll) clearInterval(poll) }
  }, [fetchMe])

  // close modal on Escape
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowRequestForm(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const openRequestFormForSelected = () => {
    if (!selectedInstitution) {
      setJoinMsg('Please choose an institution first')
      return
    }
    const inst = institutions.find(i => i._id === selectedInstitution)
    setShowRequestForm(true)
    setRequestData({ enrollmentYear: '', branch: '', rollNumber: '', course: '', collegeEmail: '' })
    setJoinMsg('')
  }

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!selectedInstitution) {
      setJoinMsg('Select an institution to request')
      return
    }
    try {
      const res = await api.post(`/api/institutions/${selectedInstitution}/request`, requestData)
      setJoinMsg(res.data.message || 'Request submitted')
      setShowRequestForm(false)
      if (fetchMe) await fetchMe()
    } catch (err) {
      setJoinMsg(err.response?.data?.message || 'Failed to send request')
    }
  }
  return (
    <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome to CareerNest</h1>
            <p className="text-sm text-gray-600">Connect with your alumni, discover opportunities and grow your career.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Your Network</h2>
              <p className="text-sm text-gray-600 mb-3">Quick overview of your membership status and join requests.</p>
              {user?.institution ? (
                <div className="mt-2 p-4 border rounded bg-orange-50">
                  <div className="text-lg font-medium">{user.institution.name}</div>
                  <div className="text-sm text-gray-600">{user.institution.type}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">You are not a member of any network yet.</div>
              )}
              {joinMsg && <div className="mt-3 text-green-600">{joinMsg}</div>}

              {/* Inline: Request to Join form and status live inside the Network panel */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-2">Request to Join a Network</h3>
                {loading && <div>Loading networks...</div>}
                {!loading && institutions.length === 0 && <div>No networks found</div>}

                <label className="block text-sm font-medium">Choose institution</label>
                <select value={selectedInstitution} onChange={e => setSelectedInstitution(e.target.value)} className="w-full p-2 border rounded mt-2">
                  <option value="">-- Select an institution --</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name} ({inst.type})</option>
                  ))}
                </select>

                <div className="mt-3">
                  <button onClick={openRequestFormForSelected} className="w-full px-3 py-2 bg-orange-600 text-white rounded">Fill request details</button>
                </div>

                {showRequestForm && (
                  // Modal overlay
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowRequestForm(false) }}
                  >
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 mx-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">Fill request details</h3>
                        <button aria-label="Close" className="text-gray-500 hover:text-gray-700" onClick={() => setShowRequestForm(false)}>✕</button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Provide your enrollment details to request membership for the selected institution.</p>
                      <form onSubmit={submitRequest} className="mt-4 space-y-3">
                        <input className="w-full p-3 border rounded" placeholder="Enrollment year" value={requestData.enrollmentYear} onChange={e => setRequestData({ ...requestData, enrollmentYear: e.target.value })} />
                        <input className="w-full p-3 border rounded" placeholder="Branch" value={requestData.branch} onChange={e => setRequestData({ ...requestData, branch: e.target.value })} />
                        <input className="w-full p-3 border rounded" placeholder="Roll number" value={requestData.rollNumber} onChange={e => setRequestData({ ...requestData, rollNumber: e.target.value })} />
                        <input className="w-full p-3 border rounded" placeholder="Course" value={requestData.course} onChange={e => setRequestData({ ...requestData, course: e.target.value })} />
                        <input className="w-full p-3 border rounded" placeholder="College email" value={requestData.collegeEmail} onChange={e => setRequestData({ ...requestData, collegeEmail: e.target.value })} />

                        <div className="flex gap-3 mt-2">
                          <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded">Send Request</button>
                          <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column intentionally left empty to keep layout spacing similar to previous design */}
          <aside />
        </div>
      </div>
  )
}

export default DashboardUser
