import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function Notifications() {
  const { isFarmer } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFarmer) {
      setList([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    getNotifications()
      .then((d) => setList(Array.isArray(d) ? d : d?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [isFarmer])

  if (!isFarmer) {
    return <div className="card text-gray-600">Notifications are for farmers.</div>
  }

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Scheme notifications</h1>
      </div>
      <p className="text-gray-600 mb-4">Latest announcements from Farmetra.</p>
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No notifications yet.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((n) => (
            <div key={n.id} className="card border-l-4 border-l-primary-600">
              <p className="text-sm text-gray-500">{formatDate(n.created_at)}</p>
              <h2 className="font-semibold text-primary-800 mt-1">{n.title}</h2>
              <p className="text-gray-700 mt-2 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
