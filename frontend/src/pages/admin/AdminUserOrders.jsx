import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetOrders } from '../../services/api'

export default function AdminUserOrders() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetOrders()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="View user orders"
      description="See orders placed by users."
      icon="📋"
      djangoUrl="/admin/orders/ordermaster/"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No user orders.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className="card">
              <p className="font-semibold text-primary-800">Order #{o.id}</p>
              <p className="text-sm text-gray-600">User ID: {o.app_user} · Total: ₹{o.total} · {o.date} · {o.status}</p>
              {o.details?.length > 0 && (
                <ul className="text-sm text-gray-600 mt-2">
                  {o.details.map((d) => (
                    <li key={d.id}>{d.farmer_product?.name || d.id} × {d.quantity} kg — ₹{d.amount}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
