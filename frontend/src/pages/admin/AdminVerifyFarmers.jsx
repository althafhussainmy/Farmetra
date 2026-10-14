import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetFarmers, adminApproveFarmer, adminRejectFarmer } from '../../services/api'

export default function AdminVerifyFarmers() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    adminGetFarmers()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await adminApproveFarmer(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  const reject = async (id) => {
    try {
      await adminRejectFarmer(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="Verify farmers"
      description="Approve or reject farmer registrations."
      icon="🌾"
      djangoUrl="/admin/users/farmer/"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No farmers.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((f) => (
            <div key={f.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-800">{f.user?.username || `#${f.id}`}</p>
                <p className="text-sm text-gray-600">Place: {f.place} · Status: <span className="capitalize">{f.state}</span></p>
                {(f.phone || f.alternate_contact) && (
                  <p className="text-sm text-primary-600 mt-1">Contact: {f.phone || ''}{f.phone && f.alternate_contact ? ' · ' : ''}{f.alternate_contact || ''}</p>
                )}
              </div>
              <div className="flex gap-2">
                {f.state !== 'approved' && (
                  <button onClick={() => approve(f.id)} className="btn btn-primary text-sm">Accept</button>
                )}
                {f.state === 'approved' && (
                  <button onClick={() => reject(f.id)} className="btn btn-outline text-sm">Set Pending</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
