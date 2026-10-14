import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getWorkRequests, createWorkRequest, approveWorkRequest, rejectWorkRequest, getWorkers } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function WorkRequests() {
  const { isFarmer, isWorker } = useAuth()
  const [list, setList] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ worker_id: '', work_description: '', wage: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    getWorkRequests()
      .then((data) => setList(Array.isArray(data) ? data : (data?.results || [])))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isFarmer && !isWorker) {
      setList([])
      setWorkers([])
      setLoading(false)
      return
    }
    setLoading(true)
    load()
    if (isFarmer) {
      getWorkers().then((data) => setWorkers(Array.isArray(data) ? data : data?.results || []))
    }
  }, [isFarmer, isWorker])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.worker_id || !form.work_description) return
    setError('')
    setSubmitting(true)
    try {
      await createWorkRequest({
        worker_id: Number(form.worker_id),
        work_description: form.work_description,
        wage: form.wage ? Number(form.wage) : undefined,
      })
      setForm({ worker_id: '', work_description: '', wage: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to send')
    } finally {
      setSubmitting(false)
    }
  }

  const approve = async (id) => {
    try {
      await approveWorkRequest(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed')
    }
  }

  const reject = async (id) => {
    try {
      await rejectWorkRequest(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed')
    }
  }

  if (!isFarmer && !isWorker) {
    return <div className="card text-gray-600">Work requests are only available for farmers and workers.</div>
  }
  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Work Requests</h1>
      </div>
      {error && <div className="card text-red-600 mb-4">{error}</div>}

      {isFarmer && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <div className="headline mb-4">
            <span className="headline-square w-1.5 h-6" />
            <h2 className="text-lg font-semibold text-primary-800">New request</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select worker *</label>
              <select
                value={form.worker_id}
                onChange={(e) => setForm((f) => ({ ...f, worker_id: e.target.value }))}
                className="input"
                required
              >
                <option value="">Select worker by name</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.user?.username || `Worker ${w.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work description *</label>
              <textarea
                value={form.work_description}
                onChange={(e) => setForm((f) => ({ ...f, work_description: e.target.value }))}
                className="input min-h-[80px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wage (optional)</label>
              <input
                type="number"
                value={form.wage}
                onChange={(e) => setForm((f) => ({ ...f, wage: e.target.value }))}
                className="input w-32"
                placeholder="0"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      )}

      <div className="headline mb-4">
        <span className="headline-square w-1.5 h-6" />
        <h2 className="text-lg font-semibold text-primary-800">
          {isFarmer ? 'Request activity' : 'Incoming queue'}
        </h2>
      </div>
      {list.length === 0 ? (
        <div className="card text-gray-600">No work requests.</div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <div key={r.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(r.date)}</p>
              <p className="font-medium text-primary-800">
                {isFarmer
                  ? `To: ${r.worker?.user?.username || `Worker #${r.worker?.id}`}`
                  : `From: ${r.farmer?.user?.username || `Farmer #${r.farmer?.id}`}`}
              </p>
              {isFarmer && r.worker?.phone && <p className="text-sm text-primary-600">Contact: {r.worker.phone}{r.worker.alternate_contact ? ` | ${r.worker.alternate_contact}` : ''}</p>}
              {isWorker && r.farmer?.phone && <p className="text-sm text-primary-600">Contact: {r.farmer.phone}{r.farmer.alternate_contact ? ` | ${r.farmer.alternate_contact}` : ''}</p>}
              <p className="text-gray-700 mt-1"><strong>Work:</strong> {r.work_description}</p>
              {r.wage && <p className="text-primary-600 mt-1"><strong>Wage:</strong> Rs {r.wage}</p>}
              <p className="text-sm capitalize mt-2"><strong>Status:</strong> {r.status}</p>
              {isWorker && r.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approve(r.id)} className="btn btn-primary text-sm">Accept</button>
                  <button onClick={() => reject(r.id)} className="btn btn-outline text-red-600 border-red-600 text-sm">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
