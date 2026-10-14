import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminGetDashboard } from '../../services/api'
import { formatDate } from '../../utils/formatDate'

function StatPill({ label, value, tone = 'primary', helper }) {
  const toneClass = {
    primary: 'bg-primary-900/40 text-emerald-100 border-primary-700',
    amber: 'bg-amber-100 text-amber-900 border-amber-200',
    green: 'bg-green-100 text-green-900 border-green-200',
    red: 'bg-red-100 text-red-900 border-red-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
  }[tone] || 'bg-primary-900/40 text-emerald-100 border-primary-700'

  return (
    <div className={`rounded-xl border px-4 py-3 backdrop-blur ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-semibold leading-tight mt-1">{value}</p>
      {helper && <p className="text-xs opacity-80 mt-0.5">{helper}</p>}
    </div>
  )
}

function QueueLink({ to, label, count, detail, tone = 'primary' }) {
  const badge = {
    primary: 'bg-primary-100 text-primary-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    slate: 'bg-slate-100 text-slate-700',
  }[tone] || 'bg-primary-100 text-primary-800'

  return (
    <Link
      to={to}
      className="flex items-start justify-between gap-3 rounded-lg border border-earth-200 px-3 py-3 hover:border-primary-200 hover:bg-primary-50 transition"
    >
      <div>
        <p className="font-semibold text-primary-800">{label}</p>
        {detail && <p className="text-xs text-gray-600 mt-0.5">{detail}</p>}
      </div>
      <span className={`inline-flex min-w-[44px] justify-center rounded-full px-3 py-1 text-sm font-semibold ${badge}`}>
        {count ?? '--'}
      </span>
    </Link>
  )
}

function MiniList({ title, items, empty, getLabel, getSub, to }) {
  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-primary-800 uppercase tracking-wide">{title}</p>
        {to && (
          <Link to={to} className="text-xs font-medium text-primary-700 hover:text-primary-800">
            View all
          </Link>
        )}
      </div>
      {items.length === 0 && <p className="text-sm text-gray-500">{empty}</p>}
      {items.length > 0 && (
        <ul className="space-y-2 text-sm text-gray-700">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-earth-200 px-3 py-2">
              <p className="font-medium text-primary-800">{getLabel(item)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{getSub(item)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const EMPTY_DASHBOARD = {
  metrics: {},
  latestComplaints: [],
  latestDisease: [],
  latestSeedRequests: [],
}

export default function OfficerDashboard() {
  const { role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD)
  const [refreshedAt, setRefreshedAt] = useState(null)

  const isStaff = role === 'admin' || role === 'officer'

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const next = await adminGetDashboard()
      setDashboard({
        metrics: next?.metrics || {},
        latestComplaints: next?.latestComplaints || [],
        latestDisease: next?.latestDisease || [],
        latestSeedRequests: next?.latestSeedRequests || [],
      })
      setRefreshedAt(new Date())
    } catch (e) {
      setDashboard(EMPTY_DASHBOARD)
      setRefreshedAt(null)
      setError(e.response?.data?.detail || 'Failed to load officer cockpit data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const metrics = useMemo(() => dashboard.metrics || {}, [dashboard.metrics])
  const latestComplaints = useMemo(() => dashboard.latestComplaints || [], [dashboard.latestComplaints])
  const latestDisease = useMemo(() => dashboard.latestDisease || [], [dashboard.latestDisease])
  const latestSeed = useMemo(() => dashboard.latestSeedRequests || [], [dashboard.latestSeedRequests])

  if (!isStaff) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-500 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm uppercase tracking-wide text-white/80">Officer cockpit</p>
            <h1 className="text-3xl font-bold leading-tight">Operations dashboard</h1>
            <p className="text-white/80 text-sm">
              Triage approvals, respond faster to farmers, and watch distribution queues - all in one place.
            </p>
            {refreshedAt && (
              <p className="text-xs text-white/70">Updated {refreshedAt.toLocaleTimeString()}</p>
            )}
          </div>
          <button
            onClick={load}
            className="btn border border-emerald-200/70 text-emerald-50 bg-primary-800/60 hover:bg-primary-700/70 focus:ring-emerald-300"
            type="button"
          >
            Refresh data
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-4 mt-5">
          <StatPill
            label="Farmers"
            value={`${metrics.pendingFarmers ?? '--'} pending / ${metrics.totalFarmers ?? '--'}`}
            helper={`${metrics.approvedFarmers ?? 0} approved`}
          />
          <StatPill
            label="Complaints awaiting reply"
            value={metrics.openComplaints ?? '--'}
            tone="amber"
          />
          <StatPill
            label="Orders in system"
            value={metrics.ordersCount ?? '--'}
            helper={`${metrics.fpOrdersCount ?? 0} farmer-side`}
            tone="slate"
          />
          <StatPill
            label="Officers on roster"
            value={metrics.officersCount ?? '--'}
            helper="Created via Add officers"
            tone="green"
          />
        </div>
      </div>

      {error && <div className="card border-red-200 text-red-700 bg-red-50">{error}</div>}
      {loading && <div className="card text-gray-600">Loading dashboard...</div>}

      {!loading && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card space-y-3">
              <div className="headline mb-2">
                <span className="headline-square" />
                <h2 className="headline-text text-xl">Approval queues</h2>
              </div>
              <QueueLink
                to="/admin/verify-farmers"
                label="Farmers pending verification"
                count={metrics.pendingFarmers}
                detail="Approve verified farmers so they can sell and request work."
              />
              <QueueLink
                to="/admin/users"
                label="Users awaiting approval"
                count={metrics.pendingUsers}
                tone="slate"
                detail="Enable marketplace access for new users."
              />
              <QueueLink
                to="/admin/workers"
                label="Workers awaiting approval"
                count={metrics.pendingWorkers}
                detail="Approve workers so farmers can hire them."
              />
            </div>

            <div className="card space-y-3">
              <div className="headline mb-2">
                <span className="headline-square" />
                <h2 className="headline-text text-xl">Support and health</h2>
              </div>
              <QueueLink
                to="/admin/complaints"
                label="Complaints without reply"
                count={metrics.openComplaints}
                tone="amber"
                detail="Respond to users and farmers."
              />
              <QueueLink
                to="/admin/crop-disease-reports"
                label="Crop disease reports"
                count={metrics.openDisease}
                tone="amber"
                detail="Send guidance and stop crop loss."
              />
              <QueueLink
                to="/admin/notifications"
                label="Send notification"
                count={metrics.notificationsCount}
                tone="slate"
                detail="Broadcast scheme updates."
              />
            </div>

            <div className="card space-y-3">
              <div className="headline mb-2">
                <span className="headline-square" />
                <h2 className="headline-text text-xl">Distribution</h2>
              </div>
              <QueueLink
                to="/admin/seed-requests"
                label="Seed or fertilizer requests"
                count={metrics.pendingSeed}
                detail="Approve or reject farmer requests."
              />
              <QueueLink
                to="/admin/subsidy"
                label="Subsidy applications"
                count={metrics.pendingSubsidy}
                tone="slate"
                detail="Review and add notes."
              />
              <QueueLink
                to="/admin/fp-orders"
                label="Farmer product orders"
                count={metrics.fpOrdersCount}
                tone="primary"
                detail="Monitor payments to farmers."
              />
            </div>
          </div>

          <div className="card space-y-3">
            <div className="headline mb-2">
              <span className="headline-square" />
              <h2 className="headline-text text-xl">Operations</h2>
            </div>
            <QueueLink
              to="/admin/user-orders"
              label="View user orders"
              count={metrics.ordersCount}
              tone="slate"
              detail="See orders placed by users."
            />
            <QueueLink
              to="/admin/work-requests"
              label="View work requests"
              count={undefined}
              detail="See requested and accepted works."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MiniList
              title="Latest complaints to reply"
              items={latestComplaints}
              empty="No complaints waiting."
              to="/admin/complaints"
              getLabel={(c) => c.sender_username || c.sender || `Complaint #${c.id}`}
              getSub={(c) => c.date || ''}
            />
            <MiniList
              title="Newest crop disease reports"
              items={latestDisease}
              empty="No new reports."
              to="/admin/crop-disease-reports"
              getLabel={(r) => r.farmer?.user?.username || `Report #${r.id}`}
              getSub={(r) => r.description?.slice(0, 80) || formatDate(r.created_at)}
            />
            <MiniList
              title="Recent seed or fertilizer requests"
              items={latestSeed}
              empty="No recent requests."
              to="/admin/seed-requests"
              getLabel={(r) => r.stock_item?.name || `Request #${r.id}`}
              getSub={(r) => `${formatDate(r.created_at)} - ${r.status}`}
            />
          </div>
        </>
      )}
    </div>
  )
}
