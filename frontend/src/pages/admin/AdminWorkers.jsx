import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetWorkers, adminApproveWorker, adminUnapproveWorker } from '../../services/api'

export default function AdminWorkers() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    adminGetWorkers()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await adminApproveWorker(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  const unapprove = async (id) => {
    try {
      await adminUnapproveWorker(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="Approve workers"
      description="View and approve workers."
      icon="👷"
      djangoUrl="/admin/users/worker/"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No workers.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((w) => (
            <div key={w.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-800">{w.user?.username || `#${w.id}`}</p>
                <p className="text-sm text-gray-600">Place: {w.place} · Skills: {w.skills} · Approved: {w.approved ? 'Yes' : 'No'}</p>
                {(w.phone || w.alternate_contact) && (
                  <p className="text-sm text-primary-600 mt-1">Contact: {w.phone || ''}{w.phone && w.alternate_contact ? ' · ' : ''}{w.alternate_contact || ''}</p>
                )}
              </div>
              <div className="flex gap-2">
                {!w.approved && <button onClick={() => approve(w.id)} className="btn btn-primary text-sm">Accept</button>}
                {w.approved && <button onClick={() => unapprove(w.id)} className="btn btn-outline text-sm">Set Pending</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
