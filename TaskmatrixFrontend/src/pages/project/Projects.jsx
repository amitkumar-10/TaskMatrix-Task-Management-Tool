import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useForm }             from 'react-hook-form'
import { getMyOrgs }           from '../../api/orgApi'
import { createProject,
         getOrgProjects }      from '../../api/projectApi'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'

const STATUS_TABS = ['All', 'Active', 'On Hold', 'Completed', 'Cancelled']

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-brand-400"
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0
         00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)

export default function Projects() {
  const navigate = useNavigate()

  const [orgs, setOrgs]           = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrg, setSelectedOrg] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating]   = useState(false)
  const [error, setError]         = useState('')

  const { register, handleSubmit, watch,
          reset, formState: { errors } } = useForm({
    defaultValues: { visibility: 'PUBLIC' }
  })

  const watchVisibility = watch('visibility')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const orgsRes = await getMyOrgs()
      setOrgs(orgsRes.data)

      // fetch projects from all orgs
      const projectPromises = orgsRes.data.map((org) =>
        getOrgProjects(org.id).then((r) =>
          r.data.map((p) => ({ ...p, orgName: org.name }))
        )
      )
      const results = await Promise.all(projectPromises)
      setAllProjects(results.flat())
    } catch {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
  setCreating(true)
  setError('')
  try {
    await createProject({
      orgId: data.orgId,
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      // Convert date → full datetime
      startDate: data.startDate ? `${data.startDate}T00:00:00` : null,
      endDate: data.endDate ? `${data.endDate}T00:00:00` : null,
    })
    reset()
    setShowModal(false)
    fetchAll()
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to create project.')
  } finally {
    setCreating(false)
  }
}

  // filter by tab + org
  const filtered = allProjects.filter((p) => {
    const tabMatch = activeTab === 'All' ||
      p.status === activeTab.toUpperCase().replace(' ', '_')
    const orgMatch = selectedOrg === 'all' || p.orgId === selectedOrg
    return tabMatch && orgMatch
  })

  const isOverdue = (date) =>
    date && new Date(date) < new Date()

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) : null

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const getProgress = (project) => {
    const total = project.totalTasks || 0
    const done  = project.tasksByStatus?.DONE || 0
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pct }
  }

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Projects</h1>
          <p className="text-sm text-brand-400 mt-0.5">
            All projects across your organisations
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5
                     bg-brand-500 hover:bg-brand-600 text-white
                     text-sm font-semibold rounded-xl transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* filter row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* org filter */}
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="px-4 py-2 text-sm border border-brand-200
                     rounded-xl text-brand-700 bg-white outline-none
                     focus:ring-2 focus:ring-brand-400 transition"
        >
          <option value="all">All Organisations</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>

      {/* loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center
                        py-24 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl
                          flex items-center justify-center mb-4">
            <FolderIcon />
          </div>
          <h2 className="text-base font-bold text-brand-900">
            No projects yet
          </h2>
          <p className="text-sm text-brand-400 mt-1 mb-4">
            Create a project to start assigning tasks to your team
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5
                       bg-brand-500 text-white text-sm font-semibold
                       rounded-xl hover:bg-brand-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </button>
        </div>
      )}

      {/* project cards grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((project) => {
            const { total, done, pct } = getProgress(project)
            const overdue = isOverdue(project.endDate)

            return (
              <div key={project.id}
                className="bg-white rounded-2xl border border-brand-100
                           p-5 shadow-sm">

                {/* top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl
                                  flex items-center justify-center">
                    <FolderIcon />
                  </div>
                  <Badge label={project.status} />
                </div>

                {/* name */}
                <h3 className="font-bold text-brand-900 text-base mb-1">
                  {project.name}
                </h3>

                {/* org + leader */}
                <div className="space-y-0.5 mb-3">
                  <div className="flex items-center gap-1.5
                                  text-sm text-brand-400">
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
                           0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1
                           m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1
                           v5m-4 0h4" />
                    </svg>
                    {project.orgName}
                  </div>
                  {project.projectLeaderName && (
                    <div className="flex items-center gap-1.5
                                    text-sm text-brand-400">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7
                             7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {project.projectLeaderName}
                    </div>
                  )}
                </div>

                {/* progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs
                                  text-brand-400 mb-1.5">
                    <span>Progress</span>
                    <span>{done}/{total} tasks done</span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* bottom row */}
                <div className="flex items-center justify-between">
                  {/* due date */}
                  <div className={`flex items-center gap-1.5 text-xs
                                   ${overdue
                                     ? 'text-red-500'
                                     : 'text-brand-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                           a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(project.endDate) || 'No deadline'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* member avatars */}
                    <div className="flex items-center">
                      {/* placeholder avatars — replace with real members later */}
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/projects/${project.id}`)
                      }
                      className="px-3 py-1.5 text-xs font-semibold
                                 border border-brand-200 text-brand-600
                                 rounded-full hover:bg-brand-50 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* create project modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); reset() }}>
          <button
            onClick={() => { setShowModal(false); reset() }}
            className="absolute top-4 right-4 text-brand-300
                       hover:text-brand-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-brand-900 mb-1">
            Create Project
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Set up a new project for your team
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm
                            rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}
                className="space-y-4">

            {/* project name */}
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Project Name
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Platform Rebrand"
                className={`w-full px-4 py-3 rounded-xl bg-brand-50
                            text-sm outline-none transition
                            focus:ring-2 focus:ring-brand-400
                            focus:bg-white
                            ${errors.name
                              ? 'ring-2 ring-red-400'
                              : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* description */}
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Description
                <span className="text-brand-300 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="What is this project about?"
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none transition resize-none
                           focus:ring-2 focus:ring-brand-400
                           focus:bg-white"
                {...register('description')}
              />
            </div>

            {/* organisation */}
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Organisation
              </label>
              <select
                className={`w-full px-4 py-3 rounded-xl bg-brand-50
                            text-sm outline-none transition
                            focus:ring-2 focus:ring-brand-400
                            text-brand-600
                            ${errors.orgId
                              ? 'ring-2 ring-red-400'
                              : ''}`}
                {...register('orgId', {
                  required: 'Please select an organisation'
                })}
              >
                <option value="">Select an organisation</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.orgId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orgId.message}
                </p>
              )}
            </div>

            {/* visibility */}
            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Visibility
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-brand-50
                           text-sm outline-none transition
                           focus:ring-2 focus:ring-brand-400
                           text-brand-600"
                {...register('visibility')}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <p className="text-xs text-brand-400 mt-1">
                {watchVisibility === 'PUBLIC'
                  ? 'Public: visible to all organisation members'
                  : 'Private: only team members can view'}
              </p>
            </div>

            {/* dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold
                                  text-brand-800 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-brand-50
                             text-sm outline-none transition
                             focus:ring-2 focus:ring-brand-400
                             text-brand-600"
                  {...register('startDate')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold
                                  text-brand-800 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-brand-50
                             text-sm outline-none transition
                             focus:ring-2 focus:ring-brand-400
                             text-brand-600"
                  {...register('endDate')}
                />
              </div>
            </div>

            {/* buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowModal(false); reset() }}
                className="flex-1 py-2.5 border border-brand-200
                           text-brand-600 text-sm font-semibold
                           rounded-xl hover:bg-brand-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 bg-brand-500 text-white
                           text-sm font-semibold rounded-xl
                           hover:bg-brand-600 transition
                           disabled:opacity-60 flex items-center
                           justify-center gap-2"
              >
                {creating && (
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                )}
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>

          </form>
        </Modal>
      )}
    </div>
  )
}