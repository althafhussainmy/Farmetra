import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetFarmingProducts, adminCreateFarmingProduct } from '../../services/api'

export default function AdminFarmingProducts() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', stock: '', price: '', image: null })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    adminGetFarmingProducts()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await adminCreateFarmingProduct({
        name: form.name,
        description: form.description,
        stock: Number(form.stock) || 0,
        price: form.price,
        image: form.image,
      })
      setForm({ name: '', description: '', stock: '', price: '', image: null })
      load()
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="Manage farming products"
      description="Add, edit, or remove catalog products."
      icon="📦"
      djangoUrl="/admin/products/farmingproduct/"
    >
      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">Create catalog item</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock * (kg)</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input" placeholder="kg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) * (/1kg)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" placeholder="/1kg" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))} className="input" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add product'}
          </button>
        </form>
      </section>

      {error && <div className="card text-red-600 mb-4">{error}</div>}
      <h2 className="text-lg font-semibold text-primary-800 mb-4">Catalog list</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No farming products.</div>}
      {!loading && list.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="card">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />}
              <p className="font-semibold text-primary-800">{p.name}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <p className="text-primary-600">₹{Number(p.price).toFixed(2)} /kg · Stock: {p.stock} kg</p>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
