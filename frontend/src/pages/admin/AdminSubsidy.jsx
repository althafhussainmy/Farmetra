import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import {
  adminGetSubsidySchemes,
  adminCreateSubsidyScheme,
  adminGetSubsidyApplications,
  adminApproveSubsidyApplication,
  adminRejectSubsidyApplication,
} from '../../services/api'
import { formatDate } from '../../utils/formatDate'

export default function AdminSubsidy() {
  const { isStaff } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState({})

  const load = async () => {
    setLoading(true)
    setError('')
    const [schemesRes, applicationsRes] = await Promise.allSettled([
      adminGetSubsidySchemes(),
      adminGetSubsidyApplications(),
    ])

    let nextError = ''

    if (schemesRes.status === 'fulfilled') {
      setSchemes(Array.isArray(schemesRes.value) ? schemesRes.value : schemesRes.value?.results || [])
    } else {
      setSchemes([])
      nextError = schemesRes.reason?.response?.data?.detail || 'Failed'
    }

    if (applicationsRes.status === 'fulfilled') {
      setApplications(Array.isArray(applicationsRes.value) ? applicationsRes.value : applicationsRes.value?.results || [])
    } else {
      setApplications([])
      nextError ||= applicationsRes.reason?.response?.data?.detail || 'Failed'
    }

    if (nextError) setError(nextError)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addScheme = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await adminCreateSubsidyScheme({
        name: form.name.trim(),
        description: form.description.trim(),
      })
      setForm({ name: '', description: '' })
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add scheme')
    } finally {
      setSubmitting(false)
    }
  }

  const approve = async (id) => {
    try {
      await adminApproveSubsidyApplication(id, notes[id])
      setNotes((n) => ({ ...n, [id]: '' }))
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  const reject = async (id) => {
    try {
      await adminRejectSubsidyApplication(id, notes[id])
      setNotes((n) => ({ ...n, [id]: '' }))
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <AdminPageLayout title="Subsidy schemes" description="View schemes already added by admin and approve farmer applications." icon="" djangoUrl="">
      {error && <div className="card text-red-600 mb-4">{error}</div>}

      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">Add new scheme</h2>
        <form onSubmit={addScheme} className="space-y-3 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheme name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input min-h-[70px]"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add scheme'}
          </button>
        </form>
      </section>

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Published list</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && schemes.length === 0 && <div className="card text-gray-600 mb-6">No schemes added yet.</div>}
      {!loading && schemes.length > 0 && (
        <div className="space-y-3 mb-6">
          {schemes.map((s) => (
            <div key={s.id} className="card">
              <p className="font-semibold text-primary-800">{s.name}</p>
              {s.description && <p className="text-sm text-gray-700 mt-1">{s.description}</p>}
              <p className="text-xs text-gray-500 mt-1">Created: {formatDate(s.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Applications</h2>
      {!loading && applications.length === 0 && <div className="card text-gray-600">No applications.</div>}
      {!loading && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="card flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{a.scheme?.name}</p>
                <p className="text-sm text-gray-600">Farmer: {a.farmer?.user?.username}</p>
                <p className="text-sm text-gray-500">{formatDate(a.applied_at)}</p>
                <p className={`text-sm font-medium mt-1 ${a.status === 'approved' ? 'text-green-600' : a.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{a.status}</p>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2 items-end">
                  <input placeholder="Note (optional)" value={notes[a.id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))} className="input text-sm w-40" />
                  <button onClick={() => approve(a.id)} className="btn btn-primary text-sm">Accept</button>
                  <button onClick={() => reject(a.id)} className="btn btn-outline text-red-600 text-sm">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
