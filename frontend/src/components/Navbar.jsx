import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { token, user, role, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <nav className="glass bg-white/70 border border-white/50 text-slate-800 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
          <Link to="/" className="font-semibold text-lg">Farmetra</Link>
          <span className="text-primary-600">Loading...</span>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-40 glass bg-white/70 border border-white/50 text-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition"
            aria-label="Go back"
          >
            Back
          </button>
          <Link to="/" className="text-xl font-bold text-primary-700 hover:text-primary-600">
            Farmetra
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 bg-white hover:bg-primary-50 transition border border-gray-200"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {token ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-2 hover:bg-primary-100 transition"
              >
                <span className="h-8 w-8 rounded-full bg-primary-600 text-white grid place-content-center font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-semibold text-primary-800 hidden sm:inline">{user?.username}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white shadow-lg p-2">
                  <p className="text-xs text-gray-500 px-2 pb-1 capitalize">{role || 'user'}</p>
                  <Link
                    to="/profile"
                    className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-primary-50"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { setOpen(false); handleLogout() }}
                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-outline text-sm"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-primary text-sm"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
