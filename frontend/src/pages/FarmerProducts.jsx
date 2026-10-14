import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFarmerProducts } from '../services/api'

export default function FarmerProducts() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [farmerId, setFarmerId] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = farmerId ? { farmer: farmerId } : {}
    getFarmerProducts(params)
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [farmerId])


  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Farmer Products</h1>
      </div>
      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Filter by Farmer ID:</label>
        <input
          type="text"
          value={farmerId}
          onChange={(e) => setFarmerId(e.target.value)}
          placeholder="Leave empty for all"
          className="input max-w-xs inline-block"
        />
      </div>
      {loading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && list.length === 0 && (
          <p className="col-span-full text-gray-600">No farmer products yet.</p>
        )}
        {!loading && list.map((p) => (
          <div key={p.id} className="card hover:shadow-md transition">
            {p.image && (
              <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <h2 className="font-semibold text-primary-800">{p.name}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
            <p className="mt-2 font-medium text-primary-600">₹{Number(p.price).toFixed(2)} /kg</p>
            <p className="text-xs text-gray-500">Stock: {p.stock} kg</p>
            {p.farmer && <p className="text-xs text-gray-500">Farmer ID: {p.farmer.id}</p>}
            <Link to={`/products/farmer-products/${p.id}`} className="btn btn-primary mt-2 w-full text-center">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
