import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCart, updateCartItem, removeFromCart, checkout } from '../services/api'

export default function Cart() {
  const { isUser } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [checkingOut, setCheckingOut] = useState(false)
  const [showMockPayment, setShowMockPayment] = useState(false)

  const load = () => {
    getCart()
      .then((data) => setItems(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load cart'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isUser) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    load()
  }, [isUser])

  const updateQty = async (id, quantity) => {
    try {
      await updateCartItem(id, quantity)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update')
    }
  }

  const remove = async (id) => {
    try {
      await removeFromCart(id)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove')
    }
  }

  const handlePlaceOrder = () => {
    if (paymentMethod === 'online') {
      setShowMockPayment(true)
    } else {
      doCheckout()
    }
  }

  const doCheckout = async () => {
    setError('')
    setShowMockPayment(false)
    setCheckingOut(true)
    try {
      await checkout(paymentMethod)
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  if (!isUser) return <div className="card text-gray-600">Cart and checkout are only available for user accounts.</div>
  if (loading) return <div className="text-center py-12 text-gray-600">Loading cart...</div>
  if (error && items.length === 0) return <div className="card text-red-600">{error}</div>

  const total = items.reduce((sum, i) => sum + (Number(i.farmer_product?.price) || 0) * (i.quantity || 0), 0)

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Cart</h1>
      </div>
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {items.length === 0 ? (
        <div className="card text-center py-12 text-gray-600">
          <p>Your cart is empty.</p>
          <Link to="/products/farmer-products" className="btn btn-primary mt-4 inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-primary-800">{i.farmer_product?.name}</h2>
                <p className="text-primary-600">Rs {Number(i.farmer_product?.price).toFixed(2)} /kg x {i.quantity} kg</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Qty (kg):</label>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => updateQty(i.id, Number(e.target.value))}
                  className="input w-20"
                />
                <button onClick={() => remove(i.id)} className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-lg font-semibold">Total: Rs {total.toFixed(2)}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                  <span>Online Payment (Mock)</span>
                </label>
              </div>
            </div>
            <button onClick={handlePlaceOrder} className="btn btn-primary" disabled={checkingOut}>
              {checkingOut ? 'Placing order...' : 'Place order'}
            </button>
          </div>
          {showMockPayment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="card max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">Mock payment</h3>
                <p className="text-gray-600 mb-2">Amount to pay: Rs {total.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-4">This is a demo. Click Pay to complete order.</p>
                <div className="flex gap-2">
                  <button onClick={doCheckout} className="btn btn-primary flex-1" disabled={checkingOut}>
                    {checkingOut ? 'Processing...' : 'Pay Rs ' + total.toFixed(2)}
                  </button>
                  <button onClick={() => setShowMockPayment(false)} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500">
            After placing order, track it from <Link to="/orders" className="text-primary-600 underline">My Orders</Link>.
          </p>
        </div>
      )}
    </div>
  )
}
