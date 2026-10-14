import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetOfficers, adminCreateOfficer, adminDeleteOfficer } from '../../services/api'

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

export default function AdminOfficers() {
  const { isAdmin } = useAuth()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    setLoading(true)
    adminGetOfficers()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const normalized = {
      username: form.username.trim(),
      password: form.password,
      email: form.email.trim().toLowerCase(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
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

    setSubmitting(true)
    try {
      await adminCreateOfficer(normalized)
      setSuccess('Officer account created. Share credentials with the officer.')
      setForm({ username: '', password: '', email: '', first_name: '', last_name: '' })
      load()
    } catch (e) {
      setError(buildApiErrorMessage(e.response?.data, 'Failed to create officer.'))
    } finally {
      setSubmitting(false)
    }
  }

  const removeOfficer = async (id, username) => {
    if (!window.confirm(`Remove officer "${username}"? They will lose access immediately.`)) return
    setError('')
    setSuccess('')
    setRemovingId(id)
    try {
      await adminDeleteOfficer(id)
      setSuccess('Officer removed.')
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to remove officer.')
    } finally {
      setRemovingId(null)
    }
  }

  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <AdminPageLayout
      title="Officers"
      description="Create staff accounts for Farmetra officers. Officers can log in and access all admin tools."
      icon="🛡️"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {success && <div className="card text-green-700 mb-4">{success}</div>}

      <form onSubmit={submit} className="card mb-6 space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold text-primary-800">New staff account</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Username *"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password *"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <input
            className="input sm:col-span-2"
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <p className="text-xs text-gray-600">Password policy: 8+ chars, uppercase, lowercase, number, special character.</p>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create officer'}
        </button>
      </form>

      <h2 className="text-lg font-semibold text-primary-800 mb-3">Team list</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : list.length === 0 ? (
        <div className="card text-gray-600">No officers yet.</div>
      ) : (
        <div className="grid gap-3">
          {list.map((o) => (
            <div key={o.id} className="card flex justify-between items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-primary-800 truncate">{o.username}</p>
                <p className="text-sm text-gray-600 truncate">
                  {[o.first_name, o.last_name].filter(Boolean).join(' ') || 'No name set'}
                </p>
                {o.email && <p className="text-sm text-gray-500 truncate">{o.email}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-primary-100 text-primary-700">Staff</span>
                <button
                  className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => removeOfficer(o.id, o.username)}
                  disabled={removingId === o.id}
                >
                  {removingId === o.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
