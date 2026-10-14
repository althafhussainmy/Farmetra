import { useState, useEffect } from 'react'
import { getComplaints, createComplaint } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function Complaints() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [complaint, setComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    getComplaints()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!complaint.trim()) return
    setError('')
    setSubmitting(true)
    try {
      await createComplaint(complaint.trim())
      setComplaint('')
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Complaints</h1>
      </div>
      <form onSubmit={handleSubmit} className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Send a complaint</label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          className="input min-h-[100px]"
          placeholder="Describe your complaint..."
          required
        />
        <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      <div className="mt-6" />
      {list.length === 0 ? (
        <div className="card text-gray-600">No complaints yet.</div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <div key={c.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(c.date)}</p>
              <p className="text-gray-800 mt-1">{c.complaint}</p>
              {c.reply ? (
                <div className="mt-3 pt-3 border-t border-earth-200">
                  <p className="text-sm font-medium text-primary-700">Reply:</p>
                  <p className="text-gray-700">{c.reply}</p>
                  {c.replied_at && <p className="text-xs text-gray-500 mt-1">{formatDate(c.replied_at)}</p>}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No reply yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
