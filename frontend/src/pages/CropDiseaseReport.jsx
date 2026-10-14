import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCropDiseaseReports, createCropDiseaseReport } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function CropDiseaseReportPage() {
  const { isFarmer } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    getCropDiseaseReports()
      .then((d) => setList(Array.isArray(d) ? d : d?.results || []))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isFarmer) load()
    else setLoading(false)
  }, [isFarmer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setError('')
    setSubmitting(true)
    try {
      await createCropDiseaseReport({ description: description.trim(), image })
      setDescription('')
      setImage(null)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isFarmer) {
    return <div className="card text-gray-600">Only farmers can report crop disease.</div>
  }

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Crop disease report</h1>
      </div>
      <p className="text-gray-600 mb-4">Upload a crop image and add a description. Admin will view and respond.</p>
      {error && <div className="card text-red-600 mb-4">{error}</div>}

      <section className="card mb-6">
        <h2 className="text-lg font-semibold text-primary-800 mb-4">Submit case</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" placeholder="Describe the crop and symptoms" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit report'}
          </button>
        </form>
      </section>

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Report history</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && list.length === 0 && <div className="card text-gray-600">No reports yet.</div>}
      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="card">
              <p className="text-sm text-gray-500">{formatDate(r.created_at)}</p>
              {r.image && <img src={r.image} alt="Crop" className="mt-2 max-h-48 rounded object-cover" />}
              <p className="text-gray-800 mt-2">{r.description}</p>
              {r.admin_reply && (
                <div className="mt-3 pt-3 border-t border-earth-200">
                  <p className="text-sm font-medium text-primary-700">Admin response:</p>
                  <p className="text-sm text-gray-700">{r.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
