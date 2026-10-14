import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFarmerProduct, addToCart } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isUser } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getFarmerProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.response?.data?.detail || 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isUser) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id, qty)
      navigate('/cart')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>
  if (error && !product) return <div className="card text-red-600">{error}</div>
  if (!product) return null

  return (
    <div className="max-w-2xl mx-auto card">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-full max-h-80 object-cover rounded-lg mb-4" />
      )}
      <div className="headline mb-2">
        <span className="headline-square" />
        <h1 className="headline-text">{product.name}</h1>
      </div>
      {product.farmer && (
        <p className="text-sm text-gray-500">Farmer ID: {product.farmer.id}</p>
      )}
      <p className="mt-2 text-gray-700">{product.description}</p>
      <p className="mt-4 text-xl font-semibold text-primary-600">₹{Number(product.price).toFixed(2)} /kg</p>
      <p className="text-sm text-gray-500">Stock: {product.stock} kg</p>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      {isUser && product.stock > 0 && (
        <div className="mt-6 flex items-center gap-4">
          <label className="text-sm font-medium">Quantity (kg):</label>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="input w-20"
          />
          <button onClick={handleAddToCart} className="btn btn-primary" disabled={adding}>
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}
      {!isUser && (
        <p className="mt-4 text-sm text-gray-600">Login as a User to add to cart.</p>
      )}
    </div>
  )
}
