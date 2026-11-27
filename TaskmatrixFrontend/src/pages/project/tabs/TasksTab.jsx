import { useState } from 'react'
import { createTask, updateTaskStatus,
         submitTask, reviewTask,
         assignTask }           from '../../../api/taskApi'
import { getTeamMembers }       from '../../../api/teamApi'
import Modal from '../../../components/Modal'

const COLUMNS = [
  { key: 'TODO',        label: 'To Do',       dot: 'bg-gray-400',  blue: false },
  { key: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-blue-500',  blue: false },
  { key: 'IN_REVIEW',   label: 'In Review',   dot: 'bg-amber-400', blue: false },
  { key: 'DONE',        label: 'Done',        dot: 'bg-green-500', blue: false },
]

const PRIORITY_STYLES = {
  LOW:      'bg-green-100 text-green-600',
  MEDIUM:   'bg-yellow-100 text-yellow-600',
  HIGH:     'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}

export default function TasksTab({
  projectId, tasks, teams, members,
  currentUserId, isAdminOrLeader, onRefresh
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [teamMembers, setTeamMembers]         = useState([])
  const [loading, setLoading]   = useState(false)

  // create task form state
  const [form, setForm] = useState({
    title: '', description: '', teamId: '',
    assignedTo: '', priority: 'MEDIUM', dueDate: ''
  })

  // submit form state
  const [submitLink, setSubmitLink] = useState('')
  const [submitNote, setSubmitNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const isOverdue = (date) =>
    date && new Date(date) < new Date()

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) : null

  const handleTeamChange = async (teamId) => {
    setForm((f) => ({ ...f, teamId, assignedTo: '' }))
    if (!teamId) { setTeamMembers([]); return }
    try {
      const res = await getTeamMembers(teamId)
      setTeamMembers(res.data)
    } catch { setTeamMembers([]) }
  }

  const handleCreateTask = async () => {
    if (!form.title || !form.teamId) return
    setLoading(true)
    try {
      await createTask({
        projectId,
        teamId:      form.teamId,
        title:       form.title,
        description: form.description,
        priority:    form.priority,
        assignedTo:  form.assignedTo || null,
        dueDate:     form.dueDate || null,
      })
      setForm({ title: '', description: '', teamId: '',
                assignedTo: '', priority: 'MEDIUM', dueDate: '' })
      setShowCreateModal(false)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (taskId) => {
    try {
      await updateTaskStatus(taskId, { status: 'IN_PROGRESS' })
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    }
  }

  const handleSubmitTask = async (taskId) => {
    if (!submitLink) return
    setLoading(true)
    try {
      await submitTask(taskId, {
        submissionLink: submitLink,
        submissionNote: submitNote,
      })
      setShowSubmitModal(null)
      setSubmitLink('')
      setSubmitNote('')
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (taskId) => {
    try {
      await reviewTask(taskId, { action: 'APPROVE', note: 'Approved' })
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    }
  }

  const handleReject = async (taskId) => {
    if (!rejectNote) return
    setLoading(true)
    try {
      await reviewTask(taskId, { action: 'REJECT', note: rejectNote })
      setShowRejectModal(null)
      setRejectNote('')
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* kanban board */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key}
              className="bg-brand-50/40 rounded-2xl p-3 min-h-96">

              {/* column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-brand-800">
                    {col.label}
                  </span>
                  <span className="text-xs bg-brand-100 text-brand-500
                                   rounded-full px-2 py-0.5 font-medium">
                    {colTasks.length}
                  </span>
                </div>
                {isAdminOrLeader && col.key === 'TODO' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-brand-400 hover:text-brand-600
                               transition w-5 h-5 flex items-center
                               justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>

              {/* task cards */}
              <div className="space-y-3">
                {colTasks.map((task) => {
                  const isAssignedToMe = task.assignedTo === currentUserId
                  const overdue = isOverdue(task.dueDate)

                  return (
                    <div key={task.id}
                      className="bg-white rounded-xl border
                                 border-brand-100 p-3.5 shadow-sm">

                      {/* title + priority */}
                      <div className="flex items-start justify-between
                                      gap-2 mb-2">
                        <p className="text-sm font-semibold
                                      text-brand-900 leading-snug">
                          {task.title}
                        </p>
                        {task.priority && (
                          <span className={`text-xs font-semibold px-2
                                           py-0.5 rounded-full shrink-0
                                           ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority.charAt(0) +
                             task.priority.slice(1).toLowerCase()}
                          </span>
                        )}
                      </div>

                      {/* team */}
                      {task.teamName && (
                        <div className="flex items-center gap-1.5
                                        text-xs text-brand-400 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round"
                              strokeLinejoin="round" strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17
                                 20H7m10 0v-2c0-.656-.126-1.283-.356
                                 -1.857M7 20H2v-2a3 3 0 015.356-1.857
                                 M7 20v-2c0-.656.126-1.283.356-1.857m0
                                 0a5.002 5.002 0 019.288 0M15 7a3 3 0
                                 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {task.teamName}
                        </div>
                      )}

                      {/* assignee */}
                      <div className="flex items-center gap-1.5
                                      text-xs text-brand-400 mb-2">
                        {task.assignedToName ? (
                          <>
                            <div className="w-5 h-5 bg-brand-100
                                            rounded-full flex items-center
                                            justify-center text-brand-600
                                            font-bold text-xs">
                              {getInitials(task.assignedToName)}
                            </div>
                            {task.assignedToName}
                          </>
                        ) : (
                          <span className="italic text-brand-300">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* due date */}
                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5
                                         text-xs mb-3
                                         ${overdue
                                           ? 'text-red-500'
                                           : 'text-brand-400'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round"
                              strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0
                                 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2
                                 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.dueDate)}
                        </div>
                      )}

                      {/* action buttons */}
                      <div className="flex items-center
                                      justify-between">
                        {/* attachment count */}
                        <div className="text-xs text-brand-300
                                        flex items-center gap-1">
                          {task.submissionLink && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round"
                                  strokeLinejoin="round" strokeWidth={2}
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828
                                     2.828l6.414-6.586a4 4 0 00-5.656
                                     -5.656l-6.415 6.585a6 6 0 108.486
                                     8.486L20.5 13" />
                              </svg>
                              1
                            </>
                          )}
                        </div>

                        {/* status actions */}
                        <div className="flex gap-1.5">
                          {col.key === 'TODO' && isAssignedToMe && (
                            <button
                              onClick={() => handleStart(task.id)}
                              className="px-3 py-1.5 bg-brand-500
                                         text-white text-xs font-semibold
                                         rounded-full hover:bg-brand-600
                                         transition"
                            >
                              Start
                            </button>
                          )}
                          {col.key === 'IN_PROGRESS' && isAssignedToMe && (
                            <button
                              onClick={() => setShowSubmitModal(task.id)}
                              className="px-3 py-1.5 bg-brand-500
                                         text-white text-xs font-semibold
                                         rounded-full hover:bg-brand-600
                                         transition"
                            >
                              Submit
                            </button>
                          )}
                          {col.key === 'IN_REVIEW' && isAdminOrLeader && (
                            <>
                              <button
                                onClick={() => handleApprove(task.id)}
                                className="px-3 py-1.5 bg-brand-500
                                           text-white text-xs font-semibold
                                           rounded-full hover:bg-brand-600
                                           transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowRejectModal(task.id)}
                                className="px-3 py-1.5 border
                                           border-red-300 text-red-500
                                           text-xs font-semibold
                                           rounded-full hover:bg-red-50
                                           transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {col.key === 'DONE' && (
                            <svg xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-green-500"
                              fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeLinecap="round"
                                strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0
                                   9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* create task modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <button
            onClick={() => setShowCreateModal(false)}
            className="absolute top-4 right-4 text-brand-300
                       hover:text-brand-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-brand-900 mb-1">
            Create Task
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Add a new task to this project
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-bold text-brand-800 mb-1">
                Task Title
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Redesign header"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-800 mb-1">
                Description
                <span className="text-brand-300 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 resize-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-800 mb-1">
                Team
              </label>
              <select
                value={form.teamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 text-brand-600"
              >
                <option value="">Select a team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-800 mb-1">
                Assign to
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignedTo: e.target.value }))
                }
                disabled={!form.teamId}
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 text-brand-600
                           disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold
                                  text-brand-800 mb-1">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-brand-50
                             text-sm outline-none focus:ring-2
                             focus:ring-brand-400 text-brand-600"
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold
                                  text-brand-800 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-brand-50
                             text-sm outline-none focus:ring-2
                             focus:ring-brand-400 text-brand-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateTask}
            disabled={loading || !form.title || !form.teamId}
            className="w-full mt-5 py-3 bg-brand-500 text-white
                       text-sm font-semibold rounded-xl
                       hover:bg-brand-600 transition disabled:opacity-60
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full
                              animate-spin" />
            )}
            Create Task
          </button>
        </Modal>
      )}

      {/* submit task modal */}
      {showSubmitModal && (
        <Modal onClose={() => setShowSubmitModal(null)}>
          <button onClick={() => setShowSubmitModal(null)}
            className="absolute top-4 right-4 text-brand-300
                       hover:text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-brand-900 mb-1">
            Submit for Review
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Add your PR, Figma, or doc link
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Submission Link
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={submitLink}
                onChange={(e) => setSubmitLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Note
                <span className="text-brand-300 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="Any notes for the reviewer..."
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none focus:ring-2
                           focus:ring-brand-400 resize-none"
              />
            </div>
          </div>
          <button
            onClick={() => handleSubmitTask(showSubmitModal)}
            disabled={loading || !submitLink}
            className="w-full mt-5 py-3 bg-brand-500 text-white
                       text-sm font-semibold rounded-xl
                       hover:bg-brand-600 transition disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </Modal>
      )}

      {/* reject modal */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(null)}>
          <button onClick={() => setShowRejectModal(null)}
            className="absolute top-4 right-4 text-brand-300
                       hover:text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-brand-900 mb-1">
            Reject Task
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Provide a reason for rejection
          </p>
          <textarea
            rows={3}
            placeholder="What needs to be changed?"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-50
                       text-sm outline-none focus:ring-2
                       focus:ring-brand-400 resize-none mb-5"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectModal(null)}
              className="flex-1 py-2.5 border border-brand-200
                         text-brand-600 text-sm font-semibold
                         rounded-xl hover:bg-brand-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReject(showRejectModal)}
              disabled={loading || !rejectNote}
              className="flex-1 py-2.5 bg-red-500 text-white
                         text-sm font-semibold rounded-xl
                         hover:bg-red-600 transition disabled:opacity-60"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}