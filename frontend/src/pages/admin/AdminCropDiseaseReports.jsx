import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetCropDiseaseReports, adminReplyCropDiseaseReport } from '../../services/api'
import { formatDate } from '../../utils/formatDate'

export default function AdminCropDiseaseReports() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const load = () => {
    adminGetCropDiseaseReports()
      .then((d) => setList(Array.isArray(d) ? d : d?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const sendReply = async (id) => {
    if (!replyText.trim()) return
    try {
      await adminReplyCropDiseaseReport(id, replyText.trim())
      setReplyId(null)
      setReplyText('')
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <AdminPageLayout title="Crop disease reports" description="View farmer reports and respond." icon="🌾" djangoUrl="">
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No reports.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((r) => (
            <div key={r.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(r.created_at)} · Farmer: {r.farmer?.user?.username}</p>
              {r.image && <img src={r.image} alt="Crop" className="mt-2 max-h-48 rounded object-cover" />}
              <p className="text-gray-800 mt-2">{r.description}</p>
              {r.admin_reply && <p className="text-sm text-primary-700 mt-2 border-t pt-2">Your response: {r.admin_reply}</p>}
              {replyId === r.id ? (
                <div className="mt-3 flex gap-2">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="input flex-1 min-h-[60px]" placeholder="Your response" />
                  <button onClick={() => sendReply(r.id)} className="btn btn-primary">Send</button>
                  <button onClick={() => { setReplyId(null); setReplyText('') }} className="btn btn-outline">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setReplyId(r.id)} className="btn btn-outline text-sm mt-2">Respond</button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
