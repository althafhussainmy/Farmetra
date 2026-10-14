import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetUsers, adminApproveUser, adminUnapproveUser } from '../../services/api'

export default function AdminUsers() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    adminGetUsers()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try {
      await adminApproveUser(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  const unapprove = async (id) => {
    try {
      await adminUnapproveUser(id)
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="View users"
      description="Browse & approve app users."
      icon="👥"
      djangoUrl="/admin/users/appuser/"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No users.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((u) => (
            <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-800">{u.user?.username || `#${u.id}`}</p>
                <p className="text-sm text-gray-600">Place: {u.place} · Approved: {u.approved ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex gap-2">
                {!u.approved && <button onClick={() => approve(u.id)} className="btn btn-primary text-sm">Accept</button>}
                {u.approved && <button onClick={() => unapprove(u.id)} className="btn btn-outline text-sm">Set Pending</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
