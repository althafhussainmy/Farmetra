import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/api'
import { showError, showSuccess } from '../utils/toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveTokens } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      const msg = 'Username is required.'
      setError(msg)
      showError(msg)
      return
    }
    if (!password) {
      const msg = 'Password is required.'
      setError(msg)
      showError(msg)
      return
    }

    setLoading(true)
    try {
      const data = await login(username.trim(), password)
      saveTokens(data.access, data.refresh)
      showSuccess('Logged in successfully')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Login failed'
      setError(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-8">
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text">Login</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
      </p>
    </div>
  )
}
