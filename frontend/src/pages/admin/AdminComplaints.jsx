import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminPageLayout from '../../components/AdminPageLayout'
import { adminGetComplaints, adminReplyComplaint } from '../../services/api'

export default function AdminComplaints() {
  const { isStaff } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const load = () => {
    adminGetComplaints()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const sendReply = async (id) => {
    if (!replyText.trim()) return
    try {
      await adminReplyComplaint(id, replyText.trim())
      setReplyId(null)
      setReplyText('')
      load()
    } catch (e) { setError(e.response?.data?.detail || 'Failed') }
  }

  if (!isStaff) return <Navigate to="/" replace />
  return (
    <AdminPageLayout
      title="View complaints & send replies"
      description="Reply to farmer and user complaints."
      icon="💬"
      djangoUrl="/admin/complaints/complaint/"
    >
      {error && <div className="card text-red-600 mb-4">{error}</div>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No complaints.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-4">
          {list.map((c) => (
            <div key={c.id} className="card">
              <p className="text-sm text-gray-500">From: {c.sender_username || c.sender} · {c.date}</p>
              <p className="text-gray-800 mt-1">{c.complaint}</p>
              {c.reply ? (
                <div className="mt-3 pt-3 border-t border-earth-200">
                  <p className="text-sm font-medium text-primary-700">Reply:</p>
                  <p className="text-gray-700">{c.reply}</p>
                  {c.replied_at && <p className="text-xs text-gray-500">{c.replied_at}</p>}
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-earth-200">
                  {replyId === c.id ? (
                    <div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="input min-h-[80px]"
                        placeholder="Type your reply..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => sendReply(c.id)} className="btn btn-primary text-sm">Send reply</button>
                        <button onClick={() => { setReplyId(null); setReplyText('') }} className="btn btn-outline text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyId(c.id)} className="btn btn-primary text-sm">Reply</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  )
}
