import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetNotifications, adminCreateNotification } from '../../services/api'
import { formatDate } from '../../utils/formatDate'

export default function AdminNotifications() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    adminGetNotifications()
      .then((d) => setList(Array.isArray(d) ? d : d?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await adminCreateNotification(form)
      setForm({ title: '', content: '' })
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
    finally { setSubmitting(false) }
  }

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <AdminPageLayout title="Scheme notifications" description="Post announcements for farmers." icon="📢" djangoUrl="">
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">New announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="input min-h-[100px]" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</button>
        </form>
      </section>
      <h2 className="text-lg font-semibold text-primary-800 mb-4">Announcement feed</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No notifications yet.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((n) => (
            <div key={n.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(n.created_at)}</p>
              <p className="font-semibold text-primary-800">{n.title}</p>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
