import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyOrgs } from '../api/orgApi'
import {
  getMyTasks, updateTaskStatus, submitTask, resubmitTask,
} from '../api/taskApi'
import Modal from '../components/Modal'
import { Icon, ICONS, FilterSelect } from '../components/ui'
import {
  PRIORITY_STYLES, STATUS_META, formatDate, isOverdue, dueTime,
} from '../utils/taskUi'

const TABS = [
  { key: 'ALL',         label: 'All' },
  { key: 'TODO',        label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW',   label: 'In Review' },
  { key: 'DONE',        label: 'Done' },
]

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-brand-50 text-sm text-brand-800 ' +
  'outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition'

// open tasks first (by due date), done tasks at the bottom
const compare = (a, b) =>
  ((a.status === 'DONE') - (b.status === 'DONE')) || (dueTime(a) - dueTime(b))

/* ───────── submit modal ───────── */
function SubmitModal({ task, onClose, onDone }) {
  const [link, setLink]     = useState('')
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // previously submitted + sent back = resubmit
  const isResubmit = !!task.submissionLink

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fn = isResubmit ? resubmitTask : submitTask
      await fn(task.id, { submissionLink: link.trim(), submissionNote: note })
      onDone()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.')
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-brand-400
                   hover:text-brand-600 transition">
        <Icon d="M6 18L18 6M6 6l12 12" />
      </button>

      <h2 className="text-xl font-bold text-brand-900 mb-1">
        {isResubmit ? 'Resubmit for Review' : 'Submit for Review'}
      </h2>
      <p className="text-sm text-brand-400 mb-5 truncate">{task.title}</p>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-800 mb-1">
            Submission Link <span className="text-red-500">*</span>
          </label>
          <input type="url" required placeholder="https://github.com/..."
            value={link} onChange={(e) => setLink(e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-800 mb-1">
            Note
            <span className="text-brand-300 font-normal ml-1">(optional)</span>
          </label>
          <textarea rows={2} placeholder="Anything the reviewer should know?"
            value={note} onChange={(e) => setNote(e.target.value)}
            className={`${inputCls} resize-none`} />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="px-6 py-2.5 border border-brand-200 text-brand-800
                       text-sm font-semibold rounded-full
                       hover:bg-brand-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white
                       text-sm font-semibold rounded-full transition
                       disabled:opacity-60">
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ───────── one row ───────── */
function TaskRow({ task, busy, onStart, onSubmit, onOpen }) {
  const done    = task.status === 'DONE'
  const overdue = isOverdue(task)
  const meta    = STATUS_META[task.status]

  return (
    <div className="px-6 py-5 border-b border-brand-50 last:border-0
                    hover:bg-brand-50 transition">
      <button onClick={onOpen}
        className={`text-left font-semibold hover:underline
                    ${done ? 'line-through text-brand-400' : 'text-brand-900'}`}>
        {task.title}
      </button>

      <p className="text-sm text-brand-400 mt-1">
        {task.projectName}
        {task.teamName && (
          <>
            <span className="inline-block w-1 h-1 rounded-full bg-brand-300
                             mx-2 align-middle" />
            {task.teamName}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <span className={`text-xs font-bold tracking-wide px-3 py-1.5
                          rounded-full ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span className={`flex items-center gap-1.5 text-sm
                            ${overdue ? 'text-red-500' : 'text-brand-400'}`}>
            <Icon d={ICONS.calendar} className="w-4 h-4" />
            {formatDate(task.dueDate)}
          </span>
        )}

        <span className={`text-sm font-medium px-4 py-1.5 rounded-full
                          ${meta.pill}`}>
          {meta.label}
        </span>

        {task.status === 'TODO' && (
          <button onClick={onStart} disabled={busy}
            className="flex items-center gap-2 px-5 py-2 bg-brand-500
                       hover:bg-brand-600 text-white text-sm font-semibold
                       rounded-full transition disabled:opacity-60">
            <Icon d={ICONS.play} className="w-3.5 h-3.5" filled />
            Start
          </button>
        )}
        {task.status === 'IN_PROGRESS' && (
          <button onClick={onSubmit}
            className="flex items-center gap-2 px-5 py-2 bg-brand-500
                       hover:bg-brand-600 text-white text-sm font-semibold
                       rounded-full transition">
            <Icon d={ICONS.send} className="w-4 h-4" />
            Submit
          </button>
        )}
        {task.status === 'IN_REVIEW' && (
          <span className="flex items-center gap-1.5 text-sm font-medium
                           text-brand-400">
            <Icon d={ICONS.clock} className="w-4 h-4" />
            Pending
          </span>
        )}
        {done && (
          <span className="flex items-center gap-1.5 text-sm font-medium
                           text-green-700">
            <Icon d={ICONS.check} className="w-4 h-4" />
            Complete
          </span>
        )}
      </div>
    </div>
  )
}

/* ───────── page ───────── */
export default function MyTasks() {
  const navigate = useNavigate()

  const [orgs, setOrgs]       = useState([])
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('ALL')
  const [orgFilter, setOrgFilter] = useState('ALL')
  const [priority, setPriority]   = useState('ALL')
  const [busyId, setBusyId]       = useState(null)
  const [submitTarget, setSubmitTarget] = useState(null)

  useEffect(() => { load() }, [])

  // tasks from every org the user belongs to
  const load = async () => {
    try {
      const orgRes = await getMyOrgs()
      setOrgs(orgRes.data)
      const lists = await Promise.all(
        orgRes.data.map((o) =>
          getMyTasks(o.id)
            .then((r) => r.data.map((t) => ({ ...t, orgName: o.name })))
            .catch(() => [])
        )
      )
      setTasks(lists.flat())
      setError('')
    } catch {
      setError('Failed to load your tasks.')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (task) => {
    setBusyId(task.id)
    try {
      await updateTaskStatus(task.id, { status: 'IN_PROGRESS' })
      await load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start task.')
    } finally {
      setBusyId(null)
    }
  }

  // org + priority filters drive the tab counts
  const base = tasks.filter((t) =>
    (orgFilter === 'ALL' || t.orgId === orgFilter) &&
    (priority === 'ALL' || t.priority === priority)
  )

  const countOf = (s) => base.filter((t) => t.status === s).length
  const counts = {
    ALL: base.length,
    TODO: countOf('TODO'),
    IN_PROGRESS: countOf('IN_PROGRESS'),
    IN_REVIEW: countOf('IN_REVIEW'),
    DONE: countOf('DONE'),
  }

  const list = [...(tab === 'ALL' ? base : base.filter((t) => t.status === tab))]
    .sort(compare)

  return (
    <div>
      {/* header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold
                        tracking-widest text-brand-500 mb-2">
          <Icon d={ICONS.clipboard} className="w-4 h-4" />
          ASSIGNED WORK
        </div>
        <h1 className="text-3xl font-bold text-brand-900">My Tasks</h1>
        <p className="text-sm text-brand-400 mt-1">
          Everything assigned to you
        </p>
      </div>

      {/* status tabs */}
      <div className="flex gap-2 border-b border-brand-100 mb-4
                      overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium
                        border-b-2 -mb-px transition
                        ${tab === t.key
                          ? 'border-brand-500 text-brand-600'
                          : 'border-transparent text-brand-400 hover:text-brand-600'}`}>
            {t.label}
            <span className="text-xs bg-brand-100 text-brand-500 rounded-full
                             px-2 py-0.5">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <FilterSelect value={orgFilter} onChange={setOrgFilter}
          className="flex-1 min-w-[200px]">
          <option value="ALL">All Organisations</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={priority} onChange={setPriority}
          className="flex-1 min-w-[200px]">
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </FilterSelect>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* nothing assigned at all */}
      {!loading && !error && tasks.length === 0 && (
        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
                          justify-center mb-4 text-brand-500">
            <Icon d={ICONS.clipboard} className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-brand-900">
            No tasks assigned to you
          </h2>
          <p className="text-sm text-brand-400 mt-1">
            When someone assigns you work, it will show up here
          </p>
        </div>
      )}

      {!loading && tasks.length > 0 && list.length === 0 && (
        <p className="text-center text-sm text-brand-400 py-16">
          No tasks match these filters.
        </p>
      )}

      {/* list */}
      {!loading && list.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm overflow-hidden">
          {list.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              busy={busyId === task.id}
              onStart={() => handleStart(task)}
              onSubmit={() => setSubmitTarget(task)}
              onOpen={() => navigate(`/projects/${task.projectId}`)}
            />
          ))}
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <p className="text-sm text-brand-300 mt-4 px-1">
          Showing {list.length} of {tasks.length} assigned tasks
        </p>
      )}

      {submitTarget && (
        <SubmitModal
          task={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onDone={() => { setSubmitTarget(null); load() }}
        />
      )}
    </div>
  )
}