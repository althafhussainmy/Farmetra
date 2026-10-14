import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSeedRequests, createSeedRequest, getStockItems } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function SeedRequests() {
  const { isFarmer } = useAuth()
  const [list, setList] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [useStock, setUseStock] = useState(true)
  const [stockItemId, setStockItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const [requestsRes, stockRes] = await Promise.allSettled([
      getSeedRequests(),
      getStockItems(),
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

  useEffect(() => {
    if (isFarmer) {
      load()
    } else {
      setLoading(false)
    }
  }, [isFarmer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (useStock && stockItemId && quantity) {
        await createSeedRequest({ stock_item_id: Number(stockItemId), quantity: Number(quantity) })
        setStockItemId('')
        setQuantity('')
      } else if (!useStock && description.trim()) {
        await createSeedRequest({ description: description.trim() })
        setDescription('')
      } else {
        setError('Select an item and quantity, or add a description.')
        setSubmitting(false)
        return
      }
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isFarmer) {
    return (
      <div className="card text-gray-600">
        Only farmers can request seeds from Farmetra.
      </div>
    )
  }

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Seed & fertilizer requests</h1>
      </div>
      <p className="text-gray-600 mb-4">Request seeds or fertilizers from Farmetra. Choose from available stock or describe your need.</p>

      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">New request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={useStock} onChange={() => setUseStock(true)} />
              <span>From stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={!useStock} onChange={() => setUseStock(false)} />
              <span>Describe (free text)</span>
            </label>
          </div>
          {useStock ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                <select value={stockItemId} onChange={(e) => setStockItemId(e.target.value)} className="input" required={useStock}>
                  <option value="">Select seed or fertilizer</option>
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.item_type}) — {s.quantity} {s.unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input w-32" placeholder="e.g. 10" required={useStock} />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" placeholder="e.g. Paddy seeds, 50 kg" required={!useStock} />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </form>
      </section>

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Request history</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No requests yet.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(r.created_at)}</p>
              <p className="text-gray-800 mt-1">
                {r.stock_item ? `${r.stock_item.name} — ${r.quantity} ${r.stock_item.unit}` : r.description}
              </p>
              <p className="text-sm mt-2">
                <span className={`font-medium ${r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                  Status: {r.status}
                </span>
              </p>
              {r.admin_notes && <p className="text-sm text-gray-600 mt-1">Admin note: {r.admin_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
