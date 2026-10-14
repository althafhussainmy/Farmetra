import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSubsidySchemes, getSubsidyApplications, createSubsidyApplication } from '../services/api'
import { formatDate } from '../utils/formatDate'

export default function Subsidy() {
  const { isFarmer } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    const [schemesRes, applicationsRes] = await Promise.allSettled([
      getSubsidySchemes(),
      getSubsidyApplications(),
    ])

    let nextError = ''

    if (schemesRes.status === 'fulfilled') {
      setSchemes(Array.isArray(schemesRes.value) ? schemesRes.value : schemesRes.value?.results || [])
    } else {
      setSchemes([])
      nextError = schemesRes.reason?.response?.data?.detail || 'Failed to load'
    }

    if (applicationsRes.status === 'fulfilled') {
      setApplications(Array.isArray(applicationsRes.value) ? applicationsRes.value : applicationsRes.value?.results || [])
    } else {
      setApplications([])
      nextError ||= applicationsRes.reason?.response?.data?.detail || 'Failed to load'
    }

    if (nextError) setError(nextError)
    setLoading(false)
  }

  useEffect(() => {
    if (isFarmer) load()
    else setLoading(false)
  }, [isFarmer])

  const apply = async (schemeId) => {
    setError('')
    setApplying(schemeId)
    try {
      await createSubsidyApplication(schemeId)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to apply')
    } finally {
      setApplying(null)
    }
  }

  if (!isFarmer) {
    return <div className="card text-gray-600">Only farmers can apply for subsidies.</div>
  }

  const appliedSchemeIds = applications.map((a) => a.scheme?.id)

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Subsidy schemes</h1>
      </div>
      <p className="text-gray-600 mb-4">Apply for subsidy schemes offered by Farmetra.</p>
      {error && <div className="card text-red-600 mb-4">{error}</div>}

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Available options</h2>
      {schemes.length === 0 && !loading && <div className="card text-gray-600">No schemes yet.</div>}
      <div className="space-y-3 mb-8">
        {schemes.map((s) => (
          <div key={s.id} className="card flex flex-wrap justify-between items-start gap-3">
            <div>
              <p className="font-semibold text-primary-800">{s.name}</p>
              <p className="text-sm text-gray-600 mt-1">{s.description}</p>
            </div>
            {appliedSchemeIds.includes(s.id) ? (
              <span className="text-sm text-gray-500">Already applied</span>
            ) : (
              <button onClick={() => apply(s.id)} className="btn btn-primary text-sm" disabled={applying === s.id}>
                {applying === s.id ? 'Applying...' : 'Apply'}
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-primary-800 mb-4">Application history</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && applications.length === 0 && <div className="card text-gray-600">No applications yet.</div>}
      {!loading && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="card">
              <p className="font-medium text-primary-800">{a.scheme?.name}</p>
              <p className="text-sm text-gray-500">{formatDate(a.applied_at)}</p>
              <p className={`text-sm font-medium mt-2 ${a.status === 'approved' ? 'text-green-600' : a.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                Status: {a.status}
              </p>
              {a.admin_notes && <p className="text-sm text-gray-600 mt-1">Admin note: {a.admin_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
