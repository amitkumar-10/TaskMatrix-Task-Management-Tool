import { useState, useEffect } from 'react'
import {
  getAllPersonalTasks, createPersonalTask,
  updatePersonalTask, deletePersonalTask,
} from '../../api/workspaceApi'
import Modal from '../../components/Modal'

const TABS = [
  { key: 'ALL',         label: 'All' },
  { key: 'TODO',        label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE',        label: 'Done' },
]

const PRIORITY_STYLES = {
  LOW:      'bg-green-100 text-green-700',
  MEDIUM:   'bg-yellow-100 text-yellow-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-600',
}

const STATUS_STYLES = {
  TODO:        { label: 'To Do',       cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-600' },
  DONE:        { label: 'Done',        cls: 'bg-green-100 text-green-700' },
}

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-brand-50 text-sm text-brand-800 ' +
  'outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition'

const toApiDate = (d) => (d ? `${d}T00:00:00` : null)

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2
         2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6 18L18 6M6 6l12 12" />
  </svg>
)

/* ───────────── Create / Edit modal ───────────── */
function TaskFormModal({ task, onClose, onSaved }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    title:       task?.title || '',
    description: task?.description || '',
    priority:    task?.priority || 'MEDIUM',
    status:      task?.status || 'TODO',
    dueDate:     task?.dueDate ? task.dueDate.slice(0, 10) : '',
    note:        task?.note || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Task title is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description,
        priority:    form.priority,
        note:        form.note,
        dueDate:     toApiDate(form.dueDate),
      }
      if (isEdit) {
        await updatePersonalTask(task.id, { ...payload, status: form.status })
      } else {
        await createPersonalTask(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-brand-400
                   hover:text-brand-600 transition">
        <CloseIcon />
      </button>

      <h2 className="text-xl font-bold text-brand-900 mb-1">
        {isEdit ? 'Edit Task' : 'Create Task'}
      </h2>
      <p className="text-sm text-brand-400 mb-5">
        {isEdit
          ? 'Update your personal task'
          : 'Add a task to your personal workspace'}
      </p>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-800 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={set('title')}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-800 mb-1">
            Description
            <span className="text-brand-300 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Add a short description"
            value={form.description}
            onChange={set('description')}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className={`grid gap-3 ${isEdit ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div>
            <label className="block text-sm font-bold text-brand-800 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select value={form.priority} onChange={set('priority')}
              className={inputCls}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-bold text-brand-800 mb-1">
                Status
              </label>
              <select value={form.status} onChange={set('status')}
                className={inputCls}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-brand-800 mb-1">
              Due Date
              <span className="text-brand-300 font-normal ml-1">(optional)</span>
            </label>
            <input type="date" value={form.dueDate}
              onChange={set('dueDate')} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-800 mb-1">
            Note
            <span className="text-brand-300 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Add any private context or reminders"
            value={form.note}
            onChange={set('note')}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-6 py-2.5 border border-brand-200 text-brand-800
                       text-sm font-semibold rounded-full
                       hover:bg-brand-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-semibold rounded-full
                       transition disabled:opacity-60 flex items-center gap-2">
            {saving && (
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full animate-spin" />
            )}
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ───────────── Delete confirm modal ───────────── */
function DeleteModal({ task, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePersonalTask(task.id)
      onDeleted()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete.')
      setDeleting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-brand-900 mb-1">
        Delete this task?
      </h2>
      <p className="text-sm text-brand-400 mb-5">This can't be undone.</p>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-6 py-2.5 border border-brand-200 text-brand-800
                     text-sm font-semibold rounded-full
                     hover:bg-brand-50 transition">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white
                     text-sm font-semibold rounded-full transition
                     disabled:opacity-60">
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

/* ───────────── Page ───────────── */
export default function Workspace() {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [openMenu, setOpenMenu] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask]     = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const res = await getAllPersonalTasks()
      setTasks(res.data)
      setError('')
    } catch {
      setError('Failed to load your tasks.')
    } finally {
      setLoading(false)
    }
  }

  const changeStatus = async (task, status) => {
    setOpenMenu(null)
    try {
      await updatePersonalTask(task.id, { status })
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task.')
    }
  }

  // ── stats ──
  const count = (s) => tasks.filter((t) => t.status === s).length
  const total = tasks.length
  const done  = count('DONE')
  const rate  = total > 0 ? Math.round((done / total) * 100) : 0

  const counts = {
    ALL: total,
    TODO: count('TODO'),
    IN_PROGRESS: count('IN_PROGRESS'),
    DONE: done,
  }

  // ── filtering ──
  const filtered = tasks.filter((t) =>
    (activeTab === 'ALL' || t.status === activeTab) &&
    (priority === 'ALL' || t.priority === priority)
  )

  const isOverdue = (t) =>
    t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date()

  const StatCard = ({ label, value, dot }) => (
    <div className="bg-white rounded-2xl border border-brand-100
                    shadow-sm p-5">
      <div className="flex items-center gap-2 text-sm text-brand-400 mb-2">
        {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />}
        {label}
      </div>
      <p className="text-3xl font-bold text-brand-900">{value}</p>
    </div>
  )

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold
                          tracking-widest text-brand-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            PERSONAL SPACE
          </div>
          <h1 className="text-3xl font-bold text-brand-900">My Workspace</h1>
          <p className="text-sm text-brand-400 mt-1">
            Your private task list, separate from any organisation
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500
                     hover:bg-brand-600 text-white text-sm font-semibold
                     rounded-full shadow-md transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* stats */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}
      >
        <StatCard label="Total Tasks"  value={total} />
        <StatCard label="To Do"        value={counts.TODO}        dot="bg-gray-400" />
        <StatCard label="In Progress"  value={counts.IN_PROGRESS} dot="bg-blue-500" />
        <StatCard label="Done"         value={done}               dot="bg-green-500" />

        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-brand-400">Completion rate</span>
            <span className="text-2xl font-bold text-brand-900">{rate}%</span>
          </div>
          <div className="w-full bg-brand-100 rounded-full h-1.5 mb-3">
            <div className="bg-brand-500 h-1.5 rounded-full transition-all"
              style={{ width: `${rate}%` }} />
          </div>
          <p className="text-xs text-brand-300">
            {done} of {total} tasks completed
          </p>
        </div>
      </div>

      {/* filter row */}
      <div className="flex items-center justify-between border-b
                      border-brand-100 mb-4">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm
                          font-medium border-b-2 -mb-px transition
                          ${activeTab === tab.key
                            ? 'border-brand-500 text-brand-600'
                            : 'border-transparent text-brand-400 hover:text-brand-600'}`}>
              {tab.label}
              <span className="text-xs bg-brand-100 text-brand-500
                               rounded-full px-2 py-0.5">
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="mb-2 px-4 py-2.5 text-sm font-medium border
                     border-brand-100 rounded-full text-brand-800 bg-white
                     outline-none focus:ring-2 focus:ring-brand-400">
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 text-sm rounded-xl
                        px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* empty — no tasks at all */}
      {!loading && total === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
                          justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-brand-400" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2
                   2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0
                   012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-brand-900">
            Nothing here yet
          </h2>
          <p className="text-sm text-brand-400 mt-1 mb-4">
            Add a personal task to start tracking your own work
          </p>
          <button onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-semibold rounded-full
                       transition">
            + Create Task
          </button>
        </div>
      )}

      {/* empty — filters hide everything */}
      {!loading && total > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-brand-400 py-16">
          No tasks match these filters.
        </p>
      )}

      {/* task list */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm">
          {filtered.map((task) => {
            const isDone   = task.status === 'DONE'
            const overdue  = isOverdue(task)
            const status   = STATUS_STYLES[task.status]

            return (
              <div key={task.id}
                className="relative flex items-center gap-4 px-6 py-5
                           border-b border-brand-50 last:border-0
                           hover:bg-brand-50 transition
                           first:rounded-t-2xl last:rounded-b-2xl">

                {/* checkbox */}
                <button
                  onClick={() => changeStatus(task, isDone ? 'TODO' : 'DONE')}
                  className={`w-7 h-7 rounded-full border-2 shrink-0 flex
                              items-center justify-center transition
                              ${isDone
                                ? 'bg-brand-500 border-brand-500'
                                : 'border-brand-200 hover:border-brand-400'}`}>
                  {isDone && (
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* title + description */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate
                                 ${isDone
                                   ? 'line-through text-brand-400'
                                   : 'text-brand-900'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-brand-400 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* priority */}
                <span className={`text-xs font-bold tracking-wide px-3 py-1.5
                                  rounded-full shrink-0
                                  ${PRIORITY_STYLES[task.priority]}`}>
                  {task.priority}
                </span>

                {/* due date */}
                <div className={`flex items-center gap-1.5 text-sm shrink-0
                                 w-36 ${overdue ? 'text-red-500' : 'text-brand-400'}`}>
                  {task.dueDate && (
                    <>
                      <CalendarIcon />
                      {formatDate(task.dueDate)}
                    </>
                  )}
                </div>

                {/* status */}
                <span className={`text-sm font-medium px-4 py-1.5 rounded-full
                                  shrink-0 ${status.cls}`}>
                  {status.label}
                </span>

                {/* 3-dot menu */}
                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === task.id ? null : task.id)
                    }
                    className="p-1.5 text-brand-300 hover:text-brand-600
                               rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
                      fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="5"  cy="12" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="19" cy="12" r="1.8" />
                    </svg>
                  </button>

                  {openMenu === task.id && (
                    <>
                      {/* click-outside catcher */}
                      <div className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-9 bg-white
                                      rounded-xl shadow-lg border
                                      border-brand-100 z-20 w-48 py-1">
                        <button
                          onClick={() => { setEditTask(task); setOpenMenu(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm
                                     text-brand-700 hover:bg-brand-50">
                          Edit
                        </button>
                        {task.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => changeStatus(task, 'IN_PROGRESS')}
                            className="w-full text-left px-4 py-2.5 text-sm
                                       text-brand-700 hover:bg-brand-50">
                            Mark In Progress
                          </button>
                        )}
                        <div className="border-t border-brand-50 my-1" />
                        <button
                          onClick={() => { setDeleteTask(task); setOpenMenu(null) }}
                          className="w-full text-left px-4 py-2.5 text-sm
                                     text-red-500 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* footer */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-sm
                        text-brand-300 mt-4 px-1">
          <span>{filtered.length} tasks</span>
          <span>Personal workspace</span>
        </div>
      )}

      {/* modals */}
      {showCreate && (
        <TaskFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); fetchTasks() }}
        />
      )}
      {editTask && (
        <TaskFormModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => { setEditTask(null); fetchTasks() }}
        />
      )}
      {deleteTask && (
        <DeleteModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onDeleted={() => { setDeleteTask(null); fetchTasks() }}
        />
      )}
    </div>
  )
}