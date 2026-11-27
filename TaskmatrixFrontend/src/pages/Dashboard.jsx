import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { getMyOrgs } from '../api/orgApi'
import { getMyTasks } from '../api/taskApi'
import { getOrgDashboard } from '../api/dashboardApi'
import { NotificationIcon, timeAgo } from '../components/NotificationParts'
import { Icon, ICONS, FilterSelect } from '../components/ui'
import {
  PRIORITY_STYLES, PRIORITY_RANK, STATUS_META,
  formatDate, isOverdue, dueTime,
} from '../utils/taskUi'

/* ───────── small building blocks ───────── */
const Card = ({ flex, children }) => (
  <div style={{ flex, minWidth: 0 }}
    className="bg-white rounded-2xl border border-brand-100 shadow-sm
               overflow-hidden">
    {children}
  </div>
)

const CardHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between px-6 py-5
                  border-b border-brand-50">
    <div>
      <h2 className="font-bold text-brand-900">{title}</h2>
      <p className="text-sm text-brand-400 mt-0.5">{subtitle}</p>
    </div>
    {right}
  </div>
)

const Empty = ({ text }) => (
  <p className="text-sm text-brand-300 text-center py-12">{text}</p>
)

function Donut({ counts, total }) {
  const R = 50
  const C = 2 * Math.PI * R
  const visible = Object.keys(STATUS_META).filter((k) => counts[k] > 0)
  const gap = visible.length > 1 ? 3 : 0
  let acc = 0

  return (
    <svg viewBox="0 0 120 120" className="w-52 h-52 shrink-0">
      <circle cx="60" cy="60" r={R} fill="none"
        stroke="#EDE9F5" strokeWidth="16" />
      <g transform="rotate(-90 60 60)">
        {visible.map((k) => {
          const len = (counts[k] / total) * C
          const seg = (
            <circle key={k} cx="60" cy="60" r={R} fill="none"
              stroke={STATUS_META[k].color} strokeWidth="16"
              strokeDasharray={`${Math.max(len - gap, 0.5)} ${C}`}
              strokeDashoffset={-acc} />
          )
          acc += len
          return seg
        })}
      </g>
      <text x="60" y="59" textAnchor="middle" fontSize="22"
        fontWeight="700" fill="#1A1625">{total}</text>
      <text x="60" y="74" textAnchor="middle" fontSize="8"
        fill="#8B7BA8">Tasks</text>
    </svg>
  )
}

/* ───────── page ───────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications } = useNotifications()

  const [orgs, setOrgs]       = useState([])
  const [orgId, setOrgId]     = useState('')
  const [tasks, setTasks]     = useState([])
  const [orgStats, setOrgStats] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingOrg, setLoadingOrg]         = useState(false)
  const [error, setError]     = useState('')

  // 1. load orgs, pick the saved one (or the first)
  useEffect(() => {
    getMyOrgs()
      .then((res) => {
        setOrgs(res.data)
        const saved = localStorage.getItem('currentOrgId')
        const pick = res.data.find((o) => o.id === saved) || res.data[0]
        if (pick) {
          setOrgId(pick.id)
          localStorage.setItem('currentOrgId', pick.id) // navbar search uses this
        }
      })
      .catch(() => setError('Failed to load your organisations.'))
      .finally(() => setInitialLoading(false))
  }, [])

  // 2. load data for the selected org
  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    setLoadingOrg(true)

    Promise.all([
      getMyTasks(orgId),
      getOrgDashboard(orgId).catch(() => null),
    ])
      .then(([tasksRes, dashRes]) => {
        if (cancelled) return
        setTasks(tasksRes.data)
        setOrgStats(dashRes?.data || null)
        setError('')
      })
      .catch(() => { if (!cancelled) setError('Failed to load dashboard data.') })
      .finally(() => { if (!cancelled) setLoadingOrg(false) })

    return () => { cancelled = true }
  }, [orgId])

  const changeOrg = (id) => {
    setOrgId(id)
    localStorage.setItem('currentOrgId', id)
  }

  // ── derived data ──
  const counts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 }
  tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++ })
  const total = counts.TODO + counts.IN_PROGRESS + counts.IN_REVIEW + counts.DONE

  const open = tasks.filter((t) => t.status !== 'DONE')

  const activeList = [...open]
    .sort((a, b) =>
      (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0) ||
      dueTime(a) - dueTime(b))
    .slice(0, 5)

  const overdue = open.filter(isOverdue)
    .sort((a, b) => dueTime(a) - dueTime(b))

  const recent = notifications.slice(0, 4)

  const stats = [
    { label: 'Organisations',   value: orgs.length,                    icon: ICONS.building },
    { label: 'Active Projects', value: orgStats?.activeProjects ?? 0,  icon: ICONS.folder },
    { label: 'My Tasks',        value: open.length,                    icon: ICONS.clipboard },
    { label: 'Completed',       value: counts.DONE,                    icon: ICONS.checkCircle },
  ]

  return (
    <div>
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold
                          tracking-widest text-brand-500 mb-2">
            <Icon d={ICONS.target} className="w-4 h-4" />
            DASHBOARD
          </div>
          <h1 className="text-3xl font-bold text-brand-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-brand-400 mt-1">
            Here's what needs your attention today
          </p>
        </div>

        {orgs.length > 0 && (
          <FilterSelect value={orgId} onChange={changeOrg}
            className="min-w-[210px]">
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </FilterSelect>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {initialLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* no organisations yet */}
      {!initialLoading && orgs.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
                          justify-center mb-4 text-brand-500">
            <Icon d={ICONS.building} className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-brand-900">
            Create your first organisation
          </h2>
          <p className="text-sm text-brand-400 mt-1 mb-5">
            Invite your team, create projects and start tracking tasks.
          </p>
          <button
            onClick={() => navigate('/organisations', { state: { openModal: true } })}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white
                       text-sm font-semibold rounded-full transition"
          >
            + New Organisation
          </button>
        </div>
      )}

      {!initialLoading && orgs.length > 0 && (
        <div className={`transition ${loadingOrg ? 'opacity-60' : ''}`}>

          {/* stat cards */}
          <div className="mb-4"
            style={{ display: 'grid', gap: 16,
                     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {stats.map((s) => (
              <div key={s.label}
                className="bg-white rounded-2xl border border-brand-100
                           shadow-sm p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm text-brand-400">{s.label}</p>
                  <p className="text-4xl font-bold text-brand-900 mt-3">
                    {s.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex
                                items-center justify-center text-brand-500">
                  <Icon d={s.icon} className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* row 2: active tasks + breakdown */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Card flex="1.45 1 420px">
              <CardHeader
                title="My Active Tasks"
                subtitle="Your highest-priority work"
                right={
                  <button onClick={() => navigate('/my-tasks')}
                    className="flex items-center gap-1.5 text-sm font-semibold
                               text-brand-500 hover:text-brand-700 transition">
                    View all
                    <Icon d={ICONS.arrowRight} className="w-4 h-4" />
                  </button>
                }
              />
              {activeList.length === 0 ? (
                <Empty text="No open tasks right now" />
              ) : (
                activeList.map((t) => (
                  <button key={t.id}
                    onClick={() => navigate(`/projects/${t.projectId}`)}
                    className="w-full text-left flex items-center
                               justify-between gap-4 px-6 py-4 border-b
                               border-brand-50 last:border-0
                               hover:bg-brand-50 transition">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-900 truncate">
                        {t.title}
                      </p>
                      <p className="text-sm text-brand-400 truncate">
                        {t.projectName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-xs font-bold tracking-wide px-3
                                        py-1.5 rounded-full
                                        ${PRIORITY_STYLES[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className={`flex items-center justify-end gap-1.5
                                        text-sm w-32
                                        ${isOverdue(t)
                                          ? 'text-red-500' : 'text-brand-400'}`}>
                        {t.dueDate && (
                          <>
                            <Icon d={ICONS.calendar} className="w-4 h-4" />
                            {formatDate(t.dueDate)}
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </Card>

            <Card flex="1 1 300px">
              <CardHeader
                title="Task Breakdown"
                subtitle={`${total} assigned task${total === 1 ? '' : 's'}`}
              />
              <div className="flex flex-wrap items-center justify-center
                              gap-8 px-6 py-8">
                <Donut counts={counts} total={total} />
                <div className="space-y-3 min-w-[160px]">
                  {Object.keys(STATUS_META).map((k) => (
                    <div key={k}
                      className="flex items-center justify-between gap-8 text-sm">
                      <span className="flex items-center gap-2 text-brand-400">
                        <span className="w-2.5 h-2.5 rounded-full"
                          style={{ background: STATUS_META[k].color }} />
                        {STATUS_META[k].label}
                      </span>
                      <span className="font-semibold text-brand-900">
                        {counts[k]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* row 3: overdue + recent activity */}
          <div className="flex flex-wrap gap-4">
            <Card flex="1 1 340px">
              <CardHeader
                title="Overdue"
                subtitle={overdue.length === 0
                  ? 'Nothing overdue'
                  : `${overdue.length} task${overdue.length === 1 ? '' : 's'} need attention`}
                right={
                  <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500
                                  flex items-center justify-center">
                    <Icon d={ICONS.warning} className="w-5 h-5" />
                  </div>
                }
              />
              {overdue.length === 0 ? (
                <Empty text="You're all on track" />
              ) : (
                overdue.map((t) => (
                  <button key={t.id}
                    onClick={() => navigate(`/projects/${t.projectId}`)}
                    className="w-full text-left flex items-start gap-3 px-6
                               py-4 border-b border-brand-50 last:border-0
                               hover:bg-brand-50 transition">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500
                                     mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900 truncate">
                        {t.title}
                      </p>
                      <p className="text-sm text-brand-400 truncate">
                        {t.projectName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-500
                                     shrink-0">
                      {formatDate(t.dueDate)}
                    </span>
                  </button>
                ))
              )}
            </Card>

            <Card flex="1.35 1 420px">
              <CardHeader
                title="Recent Activity"
                subtitle="Latest updates from your teams"
              />
              {recent.length === 0 ? (
                <Empty text="No activity yet" />
              ) : (
                recent.map((n) => (
                  <div key={n.id}
                    className="flex items-center gap-4 px-6 py-4 border-b
                               border-brand-50 last:border-0">
                    <NotificationIcon notification={n} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900 truncate">
                        {n.title}
                      </p>
                      <p className="text-sm text-brand-400 truncate">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-sm text-brand-400 shrink-0">
                      {timeAgo(n.createdAt).replace(' ago', '')}
                    </span>
                  </div>
                ))
              )}
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}