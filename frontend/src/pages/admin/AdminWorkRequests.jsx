import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { formatDate } from '../../utils/formatDate'
import api from '../../services/api'

export default function AdminWorkRequests() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/workers/requests/all/')
      .then((r) => setList(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (!isStaff) return <Navigate to="/" replace />

  const filteredList = filter === 'all' ? list : list.filter((r) => r.status === filter)

  return (
    <AdminPageLayout
      title="View work requests"
      description="See all work requests and their status."
      icon="Requests"
      djangoUrl="/admin/workers/workrequest/"
    >
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} text-sm`}>
          All ({list.length})
        </button>
        <button onClick={() => setFilter('pending')} className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'} text-sm`}>
          Pending ({list.filter((r) => r.status === 'pending').length})
        </button>
        <button onClick={() => setFilter('approved')} className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'} text-sm`}>
          Accepted ({list.filter((r) => r.status === 'approved').length})
        </button>
        <button onClick={() => setFilter('rejected')} className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'} text-sm`}>
          Rejected ({list.filter((r) => r.status === 'rejected').length})
        </button>
      </div>
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && filteredList.length === 0 && <div className="card text-gray-600">No work requests.</div>}
      {!loading && filteredList.length > 0 && (
        <div className="space-y-3">
          {filteredList.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-primary-800">Request #{r.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(r.date)}</p>
                  <p className="text-sm mt-1">
                    <strong>From:</strong> {r.farmer?.user?.username || `Farmer #${r.farmer?.id}`}
                  </p>
                  <p className="text-sm">
                    <strong>To:</strong> {r.worker?.user?.username || `Worker #${r.worker?.id}`}
                  </p>
                  <p className="text-gray-700 mt-2"><strong>Work:</strong> {r.work_description}</p>
                  {r.wage && <p className="text-primary-600 mt-1"><strong>Wage:</strong> Rs {r.wage}</p>}
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    r.status === 'approved' ? 'bg-green-100 text-green-800' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {r.status === 'approved' ? 'Accepted' : r.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
