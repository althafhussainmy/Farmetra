import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getWorkers } from '../services/api'

export default function Workers() {
  const { isFarmer } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [place, setPlace] = useState('')

  useEffect(() => {
    if (!isFarmer) {
      setList([])
      setLoading(false)
      return
    }
    setLoading(true)
    getWorkers(place ? { place } : {})
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [isFarmer, place])

  if (!isFarmer) {
    return (
      <div className="card text-gray-600">
        Only farmers can view the workers list. Go to Work Requests to see your requests.
      </div>
    )
  }

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Workers</h1>
      </div>
      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Filter by place:</label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Optional"
          className="input max-w-xs inline-block"
        />
      </div>
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-gray-600">Loading...</div>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No workers found.</div>}
      {!loading && list.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((w) => (
            <div key={w.id} className="card">
              <p className="font-semibold text-primary-800">{w.user?.username || `Worker #${w.id}`}</p>
              <p className="text-sm text-gray-600 mt-1">Place: {w.place}</p>
              <p className="text-sm text-gray-600">Skills: {w.skills}</p>
              {w.phone && <p className="text-sm text-primary-600 mt-1">Phone: {w.phone}</p>}
              {w.alternate_contact && <p className="text-sm text-gray-500">Alternate: {w.alternate_contact}</p>}
              {w.address && <p className="text-sm text-gray-500 mt-1">{w.address}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
