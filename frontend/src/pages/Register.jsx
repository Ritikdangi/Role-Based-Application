import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const NetworkIllustration = ({ className = 'w-24 h-24 mx-auto' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="60" height="60" rx="10" fill="#FF7A18" opacity="0.12"/>
    <g fill="#FF7A18">
      <circle cx="16" cy="20" r="4" />
      <circle cx="32" cy="36" r="5" />
      <circle cx="48" cy="20" r="4" />
    </g>
    <path d="M18 22 L30 32" stroke="#FF7A18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34 32 L46 22" stroke="#FF7A18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Register = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/auth/register', { name, username, email, password })
      login({ user: res.data.user, token: res.data.token })
      navigate('/user/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="max-w-[64rem] w-full px-6 md:px-10 lg:px-16 py-12 md:py-10 lg:py-16">
          <div className="mx-auto max-w-[65ch]" style={{ textAlign: 'left' }}>
            <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm shadow-sm">
              <NetworkIllustration className="w-28 h-28 mb-4" />
              <div className="mb-4" style={{ fontSize: 'clamp(28px, 2.6vw, 36px)', lineHeight: 1.05 }}>
                <Logo />
              </div>
              <h2 className="text-gray-900 font-extrabold" style={{ fontSize: 'clamp(20px, 1.6vw, 22px)' }}>Connect. Grow. Succeed with CareerNest.</h2>
              <p className="mt-3 text-gray-700" style={{ fontSize: 'clamp(15px, 1.1vw, 16px)', maxWidth: '65ch' }}>Join CareerNest to connect with alumni, explore jobs and internships, and grow your career.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 py-8">
        <div className="w-full max-w-[440px] bg-white p-8 rounded-[14px] shadow-lg">
          <h2 className="text-2xl font-bold mb-4" style={{ fontSize: 'clamp(20px, 2.2vw, 24px)' }}>Create your CareerNest account</h2>
          {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-gray-700 block mb-2">Full name</label>
              <input className="w-full h-12 p-3 border rounded text-sm" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-2">Username</label>
              <input className="w-full h-12 p-3 border rounded text-sm" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-2">Email</label>
              <input className="w-full h-12 p-3 border rounded text-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-2">Password</label>
              <input type="password" className="w-full h-12 p-3 border rounded text-sm" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 rounded text-sm font-medium">Create account</button>
          </form>
          <p className="mt-3 text-sm">Already have an account?</p>
          <div className="mt-2">
            <Link to="/login" className="text-orange-600 text-sm font-medium">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
