import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetSubsidySchemes } from '../../services/api'
import { formatDate } from '../../utils/formatDate'

export default function AdminSchemes() {
  const { isStaff } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminGetSubsidySchemes()
      .then((data) => setSchemes(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load schemes'))
      .finally(() => setLoading(false))
  }, [])

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <AdminPageLayout
      title="Added schemes"
      description="View schemes already added by admin."
      icon="Schemes"
      djangoUrl=""
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && schemes.length === 0 && <div className="card text-gray-600">No schemes added yet.</div>}
      {!loading && schemes.length > 0 && (
        <div className="space-y-3">
          {schemes.map((s) => (
            <div key={s.id} className="card">
              <p className="font-semibold text-primary-800">{s.name}</p>
              {s.description && <p className="text-sm text-gray-700 mt-1">{s.description}</p>}
              <p className="text-xs text-gray-500 mt-1">Created: {formatDate(s.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
