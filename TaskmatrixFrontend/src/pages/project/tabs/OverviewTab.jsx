const STATUS_COLORS = {
  TODO:        { dot: 'bg-gray-400',  label: 'Todo',        color: '#9CA3AF' },
  IN_PROGRESS: { dot: 'bg-blue-500',  label: 'In Progress', color: '#3B82F6' },
  IN_REVIEW:   { dot: 'bg-amber-400', label: 'In Review',   color: '#F59E0B' },
  DONE:        { dot: 'bg-green-500', label: 'Done',        color: '#22C55E' },
}

export default function OverviewTab({ tasks, teams, dashboard }) {

  const counts = {
    TODO:        tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    IN_REVIEW:   tasks.filter((t) => t.status === 'IN_REVIEW').length,
    DONE:        tasks.filter((t) => t.status === 'DONE').length,
  }
  const total = tasks.length

  // donut chart values
  const circumference = 2 * Math.PI * 45
  let offset = 0
  const segments = Object.entries(counts).map(([key, count]) => {
    const pct   = total > 0 ? count / total : 0
    const dash  = pct * circumference
    const gap   = circumference - dash
    const seg   = { key, count, dash, gap, offset,
                    color: STATUS_COLORS[key].color }
    offset += dash
    return seg
  })

  const overdueTasks = tasks.filter((t) =>
    t.dueDate && new Date(t.dueDate) < new Date() &&
    t.status !== 'DONE'
  )

  const recentActivity = [...tasks]
    .sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    )
    .slice(0, 5)

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const getTeamProgress = (teamId) => {
    const teamTasks = tasks.filter((t) => t.teamId === teamId)
    const done      = teamTasks.filter((t) => t.status === 'DONE').length
    const pct       = teamTasks.length > 0
      ? Math.round((done / teamTasks.length) * 100) : 0
    return { total: teamTasks.length, done, pct }
  }

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* left column */}
      <div className="space-y-4">

        {/* task breakdown */}
        <div className="bg-white rounded-2xl border border-brand-100
                        p-5 shadow-sm">
          <h3 className="font-bold text-brand-900 mb-4">
            Task Breakdown
          </h3>
          <div className="flex items-center gap-6">
            {/* donut chart */}
            {total > 0 ? (
              <svg width="120" height="120" viewBox="0 0 120 120">
                {segments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset + circumference / 4}
                    style={{ transform: 'rotate(-90deg)',
                             transformOrigin: '60px 60px' }}
                  />
                ))}
                <circle cx="60" cy="60" r="36"
                  fill="white" />
              </svg>
            ) : (
              <div className="w-28 h-28 rounded-full border-8
                              border-brand-100 flex items-center
                              justify-center">
                <span className="text-xs text-brand-300">No tasks</span>
              </div>
            )}

            {/* legend */}
            <div className="space-y-2">
              {Object.entries(STATUS_COLORS).map(([key, val]) => (
                <div key={key}
                  className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full
                                      ${val.dot}`} />
                    <span className="text-sm text-brand-400">
                      {val.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-brand-800">
                    {counts[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* overdue tasks */}
        <div className="bg-white rounded-2xl border border-brand-100
                        p-5 shadow-sm">
          <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-red-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Overdue Tasks
          </h3>

          {overdueTasks.length === 0 ? (
            <p className="text-sm text-brand-300 text-center py-4">
              No overdue tasks 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div key={task.id}
                  className="flex items-center justify-between
                             py-2 border-b border-brand-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      {task.title}
                    </p>
                    <p className="text-xs text-brand-400">
                      {task.assignedToName || 'Unassigned'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-500">
                    Overdue
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* right column */}
      <div className="space-y-4">

        {/* team progress */}
        <div className="bg-white rounded-2xl border border-brand-100
                        p-5 shadow-sm">
          <h3 className="font-bold text-brand-900 mb-4">
            Team Progress
          </h3>
          {teams.length === 0 ? (
            <p className="text-sm text-brand-300 text-center py-4">
              No teams created yet
            </p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => {
                const { total: tt, done, pct } = getTeamProgress(team.id)
                return (
                  <div key={team.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-brand-800">
                        {team.name}
                      </span>
                      <span className="text-brand-400">
                        {done}/{tt} tasks
                      </span>
                    </div>
                    <div className="w-full bg-brand-100 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full
                                   transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-2xl border border-brand-100
                        p-5 shadow-sm">
          <h3 className="font-bold text-brand-900 mb-4">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-brand-300 text-center py-4">
              No activity yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((task) => {
                const statusInfo = STATUS_COLORS[task.status]
                return (
                  <div key={task.id}
                    className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5
                                        shrink-0 ${statusInfo?.dot}`} />
                      <div>
                        <p className="text-sm font-medium text-brand-900">
                          {task.title}
                        </p>
                        <p className="text-xs text-brand-400">
                          moved to{' '}
                          <span className={`px-1.5 py-0.5 rounded-full
                                           text-xs font-medium
                                           ${task.status === 'DONE'
                                             ? 'bg-green-100 text-green-700'
                                             : task.status === 'IN_REVIEW'
                                             ? 'bg-amber-100 text-amber-700'
                                             : task.status === 'IN_PROGRESS'
                                             ? 'bg-blue-100 text-blue-700'
                                             : 'bg-gray-100 text-gray-600'}`}>
                            {statusInfo?.label}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-brand-300 shrink-0">
                      {timeAgo(task.updatedAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}