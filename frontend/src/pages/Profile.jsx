import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getFarmerProfile,
  getUserProfile,
  getWorkerProfile,
  updateFarmerProfile,
  updateUserProfile,
  updateWorkerProfile,
  changePassword,
} from '../services/api'

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/
const PHONE_RE = /^\+?[0-9][0-9()\-\s]{6,19}$/

function buildApiErrorMessage(payload, fallback) {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload
  if (typeof payload === 'object') {
    const parts = []
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(' ')}`)
      } else if (typeof value === 'string') {
        parts.push(`${key}: ${value}`)
      }
    })
    return parts.length ? parts.join('. ') : fallback
  }
  return fallback
}

export default function Profile() {
  const { role, profile, setProfile, user } = useAuth()
  const [form, setForm] = useState({ place: '', address: '', skills: '', phone: '', alternate_contact: '' })
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    if (!profile) {
      if (role === 'farmer') getFarmerProfile().then(setProfile).catch(() => setError('Failed to load')).finally(() => setLoading(false))
      else if (role === 'user') getUserProfile().then(setProfile).catch(() => setError('Failed to load')).finally(() => setLoading(false))
      else if (role === 'worker') getWorkerProfile().then(setProfile).catch(() => setError('Failed to load')).finally(() => setLoading(false))
      else setLoading(false)
    } else {
      setForm({ place: profile.place || '', address: profile.address || '', skills: profile.skills || '', phone: profile.phone || '', alternate_contact: profile.alternate_contact || '' })
      setLoading(false)
    }
  }, [role, profile, setProfile])

  useEffect(() => {
    if (profile) {
      setForm({ place: profile.place || '', address: profile.address || '', skills: profile.skills || '', phone: profile.phone || '', alternate_contact: profile.alternate_contact || '' })
    }
  }, [profile])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const normalized = {
      ...form,
      place: (form.place || '').trim(),
      address: (form.address || '').trim(),
      skills: (form.skills || '').trim(),
      phone: (form.phone || '').trim(),
      alternate_contact: (form.alternate_contact || '').trim(),
    }

    if (normalized.place.length < 2) {
      setError('Place must be at least 2 characters.')
      return
    }
    if (normalized.address.length < 10) {
      setError('Address must be at least 10 characters.')
      return
    }
    if (role === 'worker' && normalized.skills.length < 2) {
      setError('Skills must be at least 2 characters.')
      return
    }
    if (normalized.phone && !PHONE_RE.test(normalized.phone)) {
      setError('Phone must be a valid phone number.')
      return
    }

    setSaving(true)
    try {
      if (role === 'farmer') await updateFarmerProfile(normalized)
      else if (role === 'user') await updateUserProfile(normalized)
      else if (role === 'worker') await updateWorkerProfile(normalized)
      setProfile((p) => (p ? { ...p, ...normalized } : null))
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(buildApiErrorMessage(err.response?.data, 'Failed to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.')
      return
    }
    if (passwordForm.old_password === passwordForm.new_password) {
      setPasswordError('New password must be different from current password.')
      return
    }
    if (!PASSWORD_RE.test(passwordForm.new_password)) {
      setPasswordError('New password must include uppercase, lowercase, number, special character, and be at least 8 characters.')
      return
    }
    setChangingPassword(true)
    try {
      await changePassword(passwordForm.old_password, passwordForm.new_password)
      setPasswordMessage('Password changed successfully.')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordError(buildApiErrorMessage(err.response?.data, 'Failed to change password.'))
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>
  if (error && !profile) return <div className="card text-red-600">{error}</div>

  const roleLabel =
    role === 'farmer' ? 'Farmer'
      : role === 'worker' ? 'Worker'
        : role === 'admin' ? 'Admin'
          : role === 'officer' ? 'Officer'
            : 'User'
  const hasEditableProfile = role === 'farmer' || role === 'user' || role === 'worker'
  const accountUser = profile?.user || user

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="headline">
        <span className="headline-square" />
        <h1 className="headline-text text-xl">Profile</h1>
      </div>

      {/* Account / Login details */}
      <section className="card border-l-4 border-l-primary-600 p-3">
        <h2 className="text-sm font-semibold text-primary-800 mb-2 pb-1.5 border-b border-earth-200">
          Account details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-gray-500 font-medium">Username</dt>
            <dd className="text-gray-900 font-medium mt-0.5">{accountUser?.username ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="text-gray-900 mt-0.5">{accountUser?.email || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">First name</dt>
            <dd className="text-gray-900 mt-0.5">{accountUser?.first_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Last name</dt>
            <dd className="text-gray-900 mt-0.5">{accountUser?.last_name || '-'}</dd>
          </div>
          {profile?.age != null && (
            <div>
              <dt className="text-gray-500 font-medium">Age</dt>
              <dd className="text-gray-900 mt-0.5">{profile.age}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500 font-medium">Role</dt>
            <dd className="text-gray-900 mt-0.5 capitalize">{roleLabel}</dd>
          </div>
          {role === 'farmer' && profile?.state && (
            <div>
              <dt className="text-gray-500 font-medium">Verification status</dt>
              <dd className="text-gray-900 mt-0.5 capitalize">{profile.state}</dd>
            </div>
          )}
          {(role === 'farmer' || role === 'worker') && (profile?.phone || profile?.alternate_contact) && (
            <>
              {profile.phone && (
                <div>
                  <dt className="text-gray-500 font-medium">Phone</dt>
                  <dd className="text-gray-900 mt-0.5">{profile.phone}</dd>
                </div>
              )}
              {profile.alternate_contact && (
                <div>
                  <dt className="text-gray-500 font-medium">Alternate contact</dt>
                  <dd className="text-gray-900 mt-0.5">{profile.alternate_contact}</dd>
                </div>
              )}
            </>
          )}
        </dl>
      </section>

      {/* Profile details (editable) */}
      {hasEditableProfile ? (
        <section className="card border-l-4 border-l-primary-500 p-3">
          <h2 className="text-sm font-semibold text-primary-800 mb-2 pb-1.5 border-b border-earth-200">
            Profile details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="rounded bg-red-50 text-red-700 px-2 py-1.5 text-xs">{error}</div>}
            {message && <div className="rounded bg-green-50 text-green-700 px-2 py-1.5 text-xs">{message}</div>}
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Place</label>
                <input value={form.place} onChange={(e) => update('place', e.target.value)} className="input text-sm py-1.5" />
              </div>
              {role === 'worker' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Skills</label>
                  <input value={form.skills} onChange={(e) => update('skills', e.target.value)} className="input text-sm py-1.5" placeholder="e.g. Ploughing, Harvesting" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Address</label>
              <textarea value={form.address} onChange={(e) => update('address', e.target.value)} className="input text-sm py-1.5 min-h-[60px]" rows={2} />
            </div>
            {(role === 'farmer' || role === 'worker') && (
              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input text-sm py-1.5" placeholder="Contact number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Alternate contact</label>
                  <input value={form.alternate_contact} onChange={(e) => update('alternate_contact', e.target.value)} className="input text-sm py-1.5" placeholder="Alternate phone or contact" />
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary text-sm py-1.5 px-3" disabled={saving}>
              {saving ? 'Saving...' : 'Update profile'}
            </button>
          </form>
        </section>
      ) : (
        <section className="card border-l-4 border-l-primary-500 p-3">
          <h2 className="text-sm font-semibold text-primary-800 mb-2 pb-1.5 border-b border-earth-200">
            Profile details
          </h2>
          <p className="text-xs text-gray-600">Profile editing is not required for admin/officer accounts.</p>
        </section>
      )}

      {/* Change password */}
      <section className="card border-l-4 border-l-primary-500 p-3">
        <h2 className="text-sm font-semibold text-primary-800 mb-2 pb-1.5 border-b border-earth-200">
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-2 max-w-xs">
          {passwordError && <div className="rounded bg-red-50 text-red-700 px-2 py-1.5 text-xs">{passwordError}</div>}
          {passwordMessage && <div className="rounded bg-green-50 text-green-700 px-2 py-1.5 text-xs">{passwordMessage}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Current password</label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, old_password: e.target.value }))}
              className="input text-sm py-1.5"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">New password</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
              className="input text-sm py-1.5"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-[10px] text-gray-500 mt-0.5">At least 8 chars with upper, lower, number, and special symbol.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Confirm new password</label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
              className="input text-sm py-1.5"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary text-sm py-1.5 px-3" disabled={changingPassword}>
            {changingPassword ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </section>
    </div>
  )
}
