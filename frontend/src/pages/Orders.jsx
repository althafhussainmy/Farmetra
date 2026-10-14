import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserOrders, getFarmerProductOrders, farmerAcceptOrder, farmerShipOrder, farmerDeliverOrder } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function Orders() {
  const { role } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    if (role === 'user') {
      getUserOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.results || []))
        .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
        .finally(() => setLoading(false))
    } else if (role === 'farmer') {
      getFarmerProductOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.results || []))
        .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [role])

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

  const statusBadge = useMemo(
    () => ({
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-amber-100 text-amber-800 border-amber-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }),
    [],
  )

  const acceptOrder = async (id) => {
    try {
      await farmerAcceptOrder(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept order')
    }
  }

  const markShipped = async (id) => {
    try {
      await farmerShipOrder(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark shipped')
    }
  }

  const markDelivered = async (id) => {
    try {
      await farmerDeliverOrder(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark delivered')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>
  if (error) return <div className="card text-red-600">{error}</div>
  if (role !== 'user' && role !== 'farmer') {
    return <div className="card text-gray-600">Orders are for users and farmers.</div>
  }

  const title = role === 'user' ? 'My Orders' : 'Customer Orders for My Products'

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">{title}</h1>
      </div>
      {role === 'farmer' && (
        <p className="text-gray-600 mb-4">Orders placed by users who bought your products.</p>
      )}
      {orders.length === 0 ? (
        <div className="card text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="font-semibold">Order #{o.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(o.date)}</p>
                  <p className="text-primary-600 font-medium">Rs {o.total}</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadge[o.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    Status: {o.status}
                  </span>
                  {o.payment_method && (
                    <p className="text-sm text-gray-500">
                      Payment: {o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Mock)'}
                    </p>
                  )}
                  {o.farmer_accepted && (
                    <p className="text-sm text-green-600 font-medium">Farmer accepted</p>
                  )}
                  {!o.farmer_accepted && role === 'user' && (
                    <p className="text-sm text-gray-500">Waiting for farmer acceptance</p>
                  )}
                </div>
                {role === 'farmer' && (
                  <div className="flex flex-wrap gap-2">
                    {!o.farmer_accepted && (
                      <button onClick={() => acceptOrder(o.id)} className="btn btn-primary text-sm">
                        Accept Order
                      </button>
                    )}
                    {o.farmer_accepted && o.status !== 'shipped' && o.status !== 'delivered' && (
                      <button onClick={() => markShipped(o.id)} className="btn btn-outline text-sm">
                        Mark shipped
                      </button>
                    )}
                    {o.status === 'shipped' && (
                      <button onClick={() => markDelivered(o.id)} className="btn btn-primary text-sm">
                        Mark delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  {statusSteps.map((step) => (
                    <span key={step} className={`capitalize ${o.status === step ? 'text-primary-700 font-semibold' : ''}`}>{step}</span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {statusSteps.map((step) => {
                    const reached = statusSteps.indexOf(o.status) >= statusSteps.indexOf(step)
                    return (
                      <div
                        key={step}
                        className={`h-2 rounded-full ${reached ? 'bg-primary-500' : 'bg-earth-200'}`}
                        aria-label={step}
                      />
                    )
                  })}
                </div>
                {role === 'user' && (
                  <p className="text-xs text-gray-600 mt-2">
                    Track: pending -&gt; confirmed (farmer accepted) -&gt; shipped -&gt; delivered
                  </p>
                )}
              </div>
              {o.details?.length > 0 && (
                <ul className="mt-3 text-sm text-gray-600 border-t pt-3">
                  {o.details.map((d) => (
                    <li key={d.id}>
                      {d.farmer_product?.name || d.farming_product?.name} x {d.quantity} kg - Rs {d.amount}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
