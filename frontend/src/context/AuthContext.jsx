import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, getFarmerProfile, getUserProfile, getWorkerProfile } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access'))
  const [refresh, setRefresh] = useState(() => localStorage.getItem('refresh'))
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  // Roles: admin (superuser), officer (staff), farmer, user, worker
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!token)

  const saveTokens = (access, ref) => {
    if (access) {
      localStorage.setItem('access', access)
      setToken(access)
    }
    if (ref) {
      localStorage.setItem('refresh', ref)
      setRefresh(ref)
    }
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setToken(null)
    setRefresh(null)
    setUser(null)
    setProfile(null)
    setRole(null)
    if (typeof window !== 'undefined') {
      // Hard redirect to home ensures fresh state after logout
      window.location.replace('/')
    }
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    let active = true

    const load = async () => {
      try {
        const me = await getCurrentUser()
        if (!active) return

        setUser(me)

        if (me.is_superuser) {
          setRole('admin')
          setProfile(null)
          return
        }
        if (me.is_staff) {
          setRole('officer')
          setProfile(null)
          return
        }

        const [farmerRes, userRes, workerRes] = await Promise.allSettled([
          getFarmerProfile(),
          getUserProfile(),
          getWorkerProfile(),
        ])

        if (!active) return

        if (farmerRes.status === 'fulfilled') {
          setProfile(farmerRes.value)
          setUser(farmerRes.value?.user || me)
          setRole('farmer')
          return
        }

        if (userRes.status === 'fulfilled') {
          setProfile(userRes.value)
          setUser(userRes.value?.user || me)
          setRole('user')
          return
        }

        if (workerRes.status === 'fulfilled') {
          setProfile(workerRes.value)
          setUser(workerRes.value?.user || me)
          setRole('worker')
          return
        }

        // If no profile endpoint responds, keep the login session but fall back to a generic role.
        setProfile(null)
        setRole('user')
      } catch {
        logout()
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => { active = false }
  }, [token])

  const value = {
    token,
    refresh,
    user,
    profile,
    role,
    loading,
    setToken,
    saveTokens,
    logout,
    setProfile,
    isAdmin: role === 'admin',
    isOfficer: role === 'officer',
    isStaff: role === 'admin' || role === 'officer',
    isFarmer: role === 'farmer',
    isUser: role === 'user',
    isWorker: role === 'worker',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
