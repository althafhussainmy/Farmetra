import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFarmingProducts } from '../services/api'

export default function FarmingProducts() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getFarmingProducts()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>
  if (error) return <div className="card text-red-600">{error}</div>

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Farming Products (Catalog)</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length === 0 ? (
          <p className="col-span-full text-gray-600">No farming products yet.</p>
        ) : (
          list.map((p) => (
            <div key={p.id} className="card hover:shadow-md transition">
              {p.image && (
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h2 className="font-semibold text-primary-800">{p.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <p className="mt-2 font-medium text-primary-600">₹{p.price}</p>
              <p className="text-xs text-gray-500">Stock: {p.stock}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
