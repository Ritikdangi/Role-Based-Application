import React from 'react'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
	const { user } = useAuth()

	if (!user) return <div className="p-6">No profile available</div>

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Profile</h1>
			<div className="mt-4 bg-white rounded shadow p-6 max-w-2xl">
				<div className="mb-3"><strong>Name:</strong> {user.name || user.username}</div>
				<div className="mb-3"><strong>Username:</strong> {user.username}</div>
				<div className="mb-3"><strong>Email:</strong> {user.email}</div>
				<div className="mb-3"><strong>Role:</strong> <span className="capitalize">{user.role}</span></div>
				<div className="mb-3"><strong>Hierarchy:</strong> {user.adminHierarchy || '—'}</div>
				<div className="mb-3"><strong>Institution:</strong> {user.institution?.name || '—'}</div>
			</div>
		</div>
	)
}

export default Profile
