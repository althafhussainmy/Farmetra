import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerFarmer, registerUser, registerWorker } from '../services/api'

const initial = { username: '', email: '', password: '', first_name: '', last_name: '', age: '', place: '', address: '', skills: '' }
const USERNAME_RE = /^[A-Za-z0-9_.@+-]{3,150}$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

function buildApiErrorMessage(payload, fallback) {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload
  if (typeof payload === 'object') {
    const parts = []
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(' ')}`)
      } else if (typeof value === 'string') {
        parts.push(`${key}: ${value}`)
      }
    })
    return parts.length ? parts.join('. ') : fallback
  }
  return fallback
}

export default function Register() {
  const [role, setRole] = useState('user') // farmer | user | worker
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveTokens } = useAuth()
  const navigate = useNavigate()

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalized = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      age: form.age.trim(),
      place: form.place.trim(),
      address: form.address.trim(),
      skills: form.skills.trim(),
    }

    if (!USERNAME_RE.test(normalized.username)) {
      setError('Username must be 3-150 characters and can contain letters, numbers, and . _ @ + - only.')
      return
    }
    if (!normalized.email) {
      setError('Email is required.')
      return
    }
    if (!PASSWORD_RE.test(normalized.password)) {
      setError('Password must include uppercase, lowercase, number, special character, and be at least 8 characters.')
      return
    }
    if (normalized.age) {
      const ageNumber = Number(normalized.age)
      if (!Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 120) {
        setError('Age must be a whole number between 1 and 120.')
        return
      }
    }
    if (normalized.place.length < 2) {
      setError('Place must be at least 2 characters.')
      return
    }
    if (normalized.address.length < 10) {
      setError('Address must be at least 10 characters.')
      return
    }
    if (role === 'worker' && normalized.skills.length < 2) {
      setError('Skills must be at least 2 characters.')
      return
    }

    setLoading(true)

    const body = {
      username: normalized.username,
      email: normalized.email,
      password: normalized.password,
      first_name: normalized.first_name || undefined,
      last_name: normalized.last_name || undefined,
      age: normalized.age ? Number(normalized.age) : undefined,
      place: normalized.place,
      address: normalized.address,
    }
    if (role === 'worker') body.skills = normalized.skills
    try {
      let data
      if (role === 'farmer') data = await registerFarmer(body)
      else if (role === 'worker') data = await registerWorker(body)
      else data = await registerUser(body)
      saveTokens(data.access, data.refresh)
      navigate('/')
    } catch (err) {
      const message = buildApiErrorMessage(
        err.response?.data,
        err.response?.data?.detail || err.message || 'Registration failed. Please check your details.'
      )
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-8">
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Register</h1>
      </div>
      <div className="flex gap-2 mb-6">
        {['user', 'farmer', 'worker'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`btn flex-1 capitalize ${role === r ? 'btn-primary' : 'btn-outline'}`}
          >
            {r}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
          <input value={form.username} onChange={(e) => update('username', e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input" required minLength={8} />
          <p className="text-xs text-gray-500 mt-1">Use uppercase, lowercase, number, and special character.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              className="input"
              placeholder="Optional"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Place *</label>
          <input value={form.place} onChange={(e) => update('place', e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea value={form.address} onChange={(e) => update('address', e.target.value)} className="input min-h-[80px]" required />
        </div>
        {role === 'worker' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills *</label>
            <input value={form.skills} onChange={(e) => update('skills', e.target.value)} className="input" placeholder="e.g. Ploughing, Harvesting" required />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login</Link>
      </p>
    </div>
  )
}
