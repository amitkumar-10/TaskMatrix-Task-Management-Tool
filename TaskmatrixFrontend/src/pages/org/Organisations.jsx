import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm }             from 'react-hook-form'
import { getMyOrgs, createOrg } from '../../api/orgApi'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'

export default function Organisations() {
  const navigate = useNavigate()
  const location = useLocation()

  const [orgs, setOrgs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating]   = useState(false)
  const [error, setError]         = useState('')

  const { register, handleSubmit,
          reset, formState: { errors } } = useForm()

  // auto open modal if navigated from navbar button
  useEffect(() => {
    if (location.state?.openModal) {
      setShowModal(true)
      // clear state so refreshing doesn't reopen
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // ── fetch orgs ───────────────────────────────────────────────
  useEffect(() => {
    fetchOrgs()
  }, [])

  const fetchOrgs = async () => {
    setLoading(true)
    try {
      const res = await getMyOrgs()
      setOrgs(res.data)
    } catch {
      setError('Failed to load organisations.')
    } finally {
      setLoading(false)
    }
  }

  // ── create org ───────────────────────────
  const onSubmit = async (data) => {
    setCreating(true)
    try {
      await createOrg({
        name:        data.name,
        description: data.description,
      })
      reset()
      setShowModal(false)
      fetchOrgs()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create.')
    } finally {
      setCreating(false)
    }
  }

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const getUserRole = (org) => org.userRole || 'MEMBER'

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">
            My Organisations
          </h1>
          <p className="text-sm text-brand-400 mt-0.5">
            Manage your workspaces
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
          New Organisation
        </button>
      </div>

      {/* loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full
                          animate-spin" />
        </div>
      )}

      {/* empty state */}
      {!loading && orgs.length === 0 && (
        <div className="flex flex-col items-center justify-center
                        py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl
                          flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-brand-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
                   0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1
                   m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5
                   m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-brand-900">
            No organisations yet
          </h2>
          <p className="text-sm text-brand-400 mt-1 mb-4">
            Create one to start collaborating with your team
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-brand-500 text-white
                       text-sm font-semibold rounded-xl
                       hover:bg-brand-600 transition"
          >
            + Create Organisation
          </button>
        </div>
      )}

      {/* org cards grid */}
      {!loading && orgs.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {orgs.map((org) => (
            <div key={org.id}
              className="bg-white rounded-2xl border border-brand-100
                         p-5 shadow-sm">

              {/* top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-brand-100 rounded-full
                                flex items-center justify-center
                                text-brand-600 font-bold text-sm">
                  {getInitials(org.name)}
                </div>
                <Badge label={getUserRole(org)} />
              </div>

              {/* name + desc */}
              <h3 className="font-bold text-brand-900 text-base mb-1">
                {org.name}
              </h3>
              <p className="text-sm text-brand-400 truncate mb-3">
                {org.description || 'No description'}
              </p>

              {/* member count */}
              <div className="flex items-center gap-1.5
                              text-sm text-brand-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
                       0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3
                       3 0 015.356-1.857M7 20v-2c0-.656.126-1.283
                       .356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3
                       3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {org.totalMembers} members
              </div>

              {/* open button */}
              <button
                onClick={() => navigate(`/organisations/${org.id}`)}
                className="w-full py-2 border border-brand-200
                           text-brand-600 text-sm font-semibold
                           rounded-full hover:bg-brand-50 transition"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      )}

      {/* create org modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); reset() }}>

          {/* close button */}
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
            Create Organisation
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Set up a workspace for your team
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm
                            rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}
                className="space-y-4">

            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Organisation Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                className={`w-full px-4 py-3 rounded-xl border
                            text-sm outline-none transition
                            focus:ring-2 focus:ring-brand-400
                            ${errors.name
                              ? 'border-red-400'
                              : 'border-brand-200'}`}
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold
                                text-brand-800 mb-1">
                Description
                <span className="text-brand-300 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                placeholder="What is this organisation for?"
                className="w-full px-4 py-3 rounded-xl border
                           border-brand-200 text-sm outline-none
                           transition focus:ring-2 focus:ring-brand-400
                           resize-none"
                {...register('description')}
              />
            </div>

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