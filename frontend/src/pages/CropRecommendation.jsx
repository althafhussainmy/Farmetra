import { useState } from 'react'
import { getCropRecommendation } from '../services/api'

const SOIL_OPTIONS = ['Loam', 'Clay', 'Sandy', 'Sandy Loam', 'Clay Loam', 'Silty Clay', 'Black Soil']
const WATER_OPTIONS = ['High', 'Medium', 'Low']
const CLIMATE_OPTIONS = ['Tropical', 'Subtropical', 'Temperate', 'Arid']

export default function CropRecommendation() {
  const [soil_type, setSoil_type] = useState('')
  const [water_availability, setWater_availability] = useState('')
  const [climate, setClimate] = useState('')
  const [ph, setPh] = useState('')
  const [previous_crop, setPrevious_crop] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!soil_type || !water_availability || !climate) {
      setError('Soil type, water availability, and climate are required.')
      return
    }
    setError('')
    setLoading(true)
    setResults(null)
    try {
      const body = { soil_type, water_availability, climate }
      if (ph) body.ph = Number(ph)
      if (previous_crop) body.previous_crop = previous_crop
      const data = await getCropRecommendation(body)
      setResults(data.recommendations || [])
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Crop Recommendation</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Enter your land parameters to get tailored crop suggestions based on soil, water, and climate.
      </p>
      <form onSubmit={handleSubmit} className="card max-w-xl mb-6">
        {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm mb-4">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil type *</label>
            <select
              value={soil_type}
              onChange={(e) => setSoil_type(e.target.value)}
              className="input"
              required
            >
              <option value="">Select</option>
              {SOIL_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water availability *</label>
            <select
              value={water_availability}
              onChange={(e) => setWater_availability(e.target.value)}
              className="input"
              required
            >
              <option value="">Select</option>
              {WATER_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Climate *</label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value)}
              className="input"
              required
            >
              <option value="">Select</option>
              {CLIMATE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH (optional)</label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="9"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="input"
              placeholder="e.g. 6.5"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Previous crop (optional)</label>
          <input
            type="text"
            value={previous_crop}
            onChange={(e) => setPrevious_crop(e.target.value)}
            className="input"
            placeholder="e.g. Rice"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
          {loading ? 'Getting recommendations...' : 'Get Recommendations'}
        </button>
      </form>

      {results && results.length > 0 && (
        <div className="card max-w-xl">
          <div className="headline mb-4">
          <span className="headline-square w-1.5 h-6" />
          <h2 className="text-lg font-semibold text-primary-800">Recommended crops</h2>
        </div>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="border-b border-earth-200 pb-3 last:border-0">
                <p className="font-medium text-primary-700">{r.crop}</p>
                <p className="text-sm text-gray-600">{r.match_reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
