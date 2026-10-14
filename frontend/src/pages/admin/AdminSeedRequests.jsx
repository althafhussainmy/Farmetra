import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import {
  adminGetSeedRequests,
  adminApproveSeedRequest,
  adminRejectSeedRequest,
  adminGetStockItems,
  adminCreateStockItem,
} from '../../services/api'
import { formatDate } from '../../utils/formatDate'

export default function AdminSeedRequests() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})
  const [stockForm, setStockForm] = useState({ name: '', item_type: 'seed', quantity: '', unit: 'kg' })
  const [stockSubmitting, setStockSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const [requestsRes, stockRes] = await Promise.allSettled([
      adminGetSeedRequests(),
      adminGetStockItems(),
    ])

    let nextError = ''

    if (requestsRes.status === 'fulfilled') {
      setList(Array.isArray(requestsRes.value) ? requestsRes.value : requestsRes.value?.results || [])
    } else {
      setList([])
      nextError = requestsRes.reason?.response?.data?.detail || 'Failed to load'
    }

    if (stockRes.status === 'fulfilled') {
      setStockItems(Array.isArray(stockRes.value) ? stockRes.value : stockRes.value?.results || [])
    } else {
      setStockItems([])
      nextError ||= stockRes.reason?.response?.data?.detail || 'Failed to load stock items'
    }

    if (nextError) setError(nextError)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addStock = async (e) => {
    e.preventDefault()
    const q = parseFloat(stockForm.quantity)
    if (!stockForm.name.trim() || isNaN(q) || q <= 0) return
    setStockSubmitting(true)
    setError('')
    try {
      await adminCreateStockItem({
        name: stockForm.name.trim(),
        item_type: stockForm.item_type,
        quantity: q,
        unit: stockForm.unit || 'kg',
      })
      setStockForm({ name: '', item_type: 'seed', quantity: '', unit: 'kg' })
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add stock')
    } finally {
      setStockSubmitting(false)
    }
  }

  const approve = async (id) => {
    try {
      await adminApproveSeedRequest(id, notes[id] || '')
      setNotes((n) => ({ ...n, [id]: '' }))
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  const reject = async (id) => {
    try {
      await adminRejectSeedRequest(id, notes[id] || '')
      setNotes((n) => ({ ...n, [id]: '' }))
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <AdminPageLayout
      title="Seed & fertilizer distribution"
      description="Add stock, then approve or reject farmer requests. Stock decreases when you accept a request."
      icon="🌱"
      djangoUrl=""
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}

      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">Add stock (seeds / fertilizers)</h2>
        <form onSubmit={addStock} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              value={stockForm.name}
              onChange={(e) => setStockForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="e.g. Paddy seeds"
              required
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={stockForm.item_type}
                onChange={(e) => setStockForm((f) => ({ ...f, item_type: e.target.value }))}
                className="input"
              >
                <option value="seed">Seed</option>
                <option value="fertilizer">Fertilizer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={stockForm.quantity}
                onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
                className="input w-28"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                value={stockForm.unit}
                onChange={(e) => setStockForm((f) => ({ ...f, unit: e.target.value }))}
                className="input w-20"
                placeholder="kg"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={stockSubmitting}>
            {stockSubmitting ? 'Adding...' : 'Add stock'}
          </button>
        </form>
        {stockItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Current stock</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {stockItems.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.item_type}) — {s.quantity} {s.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Farmer requests (approve / reject)</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No seed requests.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-primary-800">Request #{r.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(r.created_at)}</p>
                  <p className="text-sm mt-1"><strong>Farmer:</strong> {r.farmer?.user?.username || `#${r.farmer?.id}`}</p>
                  {(r.farmer?.phone || r.farmer?.alternate_contact) && (
                    <p className="text-sm text-primary-600">Contact: {r.farmer.phone || ''}{r.farmer.phone && r.farmer.alternate_contact ? ' · ' : ''}{r.farmer.alternate_contact || ''}</p>
                  )}
                  {r.stock_item ? (
                    <div className="mt-2">
                      <p className="text-gray-800 font-medium">
                        {r.stock_item.name} ({r.stock_item.item_type}) — {r.quantity} {r.stock_item.unit}
                      </p>
                      {r.description && r.description !== `${r.stock_item.name} - ${r.quantity} ${r.stock_item.unit}` && (
                        <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-800 mt-2">{r.description}</p>
                  )}
                  <p className={`text-sm font-medium mt-2 ${r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    Status: {r.status}
                  </p>
                  {r.admin_notes && <p className="text-sm text-gray-600 mt-1">Note: {r.admin_notes}</p>}
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {r.status === 'pending' && (
                    <>
                      <input
                        type="text"
                        placeholder="Admin note (optional)"
                        value={notes[r.id] || ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        className="input text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => approve(r.id)} className="btn btn-primary text-sm">Accept</button>
                        <button onClick={() => reject(r.id)} className="btn btn-outline text-red-600 border-red-600 text-sm">Reject</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
