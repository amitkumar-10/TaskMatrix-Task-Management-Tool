import { useState, useEffect }    from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrg, getOrgMembers,
         updateMemberRole, removeMember } from '../../api/orgApi'
import { getPendingInvitations,
         sendInvitation, cancelInvitation,
         resendInvitation }               from '../../api/invitationApi'
import { getOrgProjects }                 from '../../api/projectApi'
import { useAuth }                        from '../../context/AuthContext'
import Modal  from '../../components/Modal'
import Badge  from '../../components/Badge'
import MembersTab     from './tabs/MembersTab'
import InvitationsTab from './tabs/InvitationsTab'
import ProjectsTab    from './tabs/ProjectsTab'

export default function OrgDetail() {
  const { orgId }    = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [org, setOrg]           = useState(null)
  const [members, setMembers]   = useState([])
  const [invitations, setInvitations] = useState([])
  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState('members')
  const [loading, setLoading]   = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const myRole = members.find(
    (m) => m.userId === user?.userId
  )?.role || 'MEMBER'

  const isAdmin = myRole === 'ADMIN'

  useEffect(() => { fetchAll() }, [orgId])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [orgRes, membersRes, invRes, projRes] =
        await Promise.all([
          getOrg(orgId),
          getOrgMembers(orgId),
          getPendingInvitations(orgId).catch(() => ({ data: [] })),
          getOrgProjects(orgId),
        ])
      setOrg(orgRes.data)
      setMembers(membersRes.data)
      setInvitations(invRes.data)
      setProjects(projRes.data)

      localStorage.setItem('currentOrgId', orgId)
      
    } catch {
      navigate('/organisations')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    setInviteError('')
    try {
      await sendInvitation({ orgId, email: inviteEmail })
      setInviteEmail('')
      setShowInviteModal(false)
      fetchAll()
    } catch (err) {
      setInviteError(
        err.response?.data?.error || 'Failed to send invitation.'
      )
    } finally {
      setInviting(false)
    }
  }

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const tabs = ['members', 'invitations', 'projects']

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-500
                      border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>

      {/* back */}
      <button
        onClick={() => navigate('/organisations')}
        className="flex items-center gap-1 text-sm text-brand-400
                   hover:text-brand-600 transition mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Organisations
      </button>

      {/* org header card */}
      <div className="bg-white rounded-2xl border border-brand-100
                      p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">
            {/* avatar */}
            <div className="w-14 h-14 bg-brand-100 rounded-full
                            flex items-center justify-center
                            text-brand-600 font-bold text-lg">
              {getInitials(org?.name)}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-brand-900">
                {org?.name}
              </h1>
              <Badge label={myRole} />
              <p className="text-sm text-brand-400 mt-1">
                {org?.description}
              </p>

              <div className="flex gap-2 mt-3">
                <span className="flex items-center gap-1.5 px-3 py-1
                                 bg-brand-50 rounded-full text-xs
                                 text-brand-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
                         0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3
                         3 0 015.356-1.857M7 20v-2c0-.656.126-1.283
                         .356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3
                         3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {org?.totalMembers} Members
                </span>

                <span className="flex items-center gap-1.5 px-3 py-1
                                 bg-brand-50 rounded-full text-xs
                                 text-brand-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0
                         00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {projects.length} Projects
                </span>
              </div>
            </div>
          </div>

          {/* action buttons — admin only */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2
                           bg-brand-500 hover:bg-brand-600 text-white
                           text-sm font-semibold rounded-xl transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8
                       0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite Member
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2
                           border border-brand-200 text-brand-600
                           text-sm font-semibold rounded-xl
                           hover:bg-brand-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724
                       1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37
                       2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756
                       2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94
                       1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572
                       1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724
                       0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a
                       1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756
                       -2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94
                       -1.543.826-3.31 2.37-2.37.996.608 2.296.07
                       2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          )}

        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-6 border-b border-brand-100 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize
            transition border-b-2 -mb-px
            ${activeTab === tab
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-brand-300 hover:text-brand-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* tab content */}
      {activeTab === 'members' && (
        <MembersTab
          members={members}
          isAdmin={isAdmin}
          currentUserId={user?.userId}
          orgId={orgId}
          onRefresh={fetchAll}
        />
      )}
      {activeTab === 'invitations' && (
        <InvitationsTab
          invitations={invitations}
          isAdmin={isAdmin}
          orgId={orgId}
          onRefresh={fetchAll}
        />
      )}
      {activeTab === 'projects' && (
        <ProjectsTab projects={projects} />
      )}

      {/* invite modal */}
      {showInviteModal && (
        <Modal onClose={() => {
          setShowInviteModal(false)
          setInviteEmail('')
          setInviteError('')
        }}>
          <button
            onClick={() => setShowInviteModal(false)}
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
            Invite Member
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            They'll receive an email invitation
          </p>

          {inviteError && (
            <div className="bg-red-50 text-red-500 text-sm
                            rounded-xl px-4 py-3 mb-4">
              {inviteError}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold
                              text-brand-800 mb-1">
              Email address
            </label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-brand-300 absolute left-3
                           top-1/2 -translate-y-1/2"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
                     2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
                     2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border
                           border-brand-200 text-sm outline-none
                           focus:ring-2 focus:ring-brand-400
                           bg-brand-50 transition"
              />
            </div>
          </div>

          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600
                       text-white text-sm font-semibold rounded-xl
                       transition disabled:opacity-60
                       flex items-center justify-center gap-2 mb-3"
          >
            {inviting && (
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full
                              animate-spin" />
            )}
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
                   2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
                   2 0 002 2z" />
            </svg>
            {inviting ? 'Sending...' : 'Send Invitation'}
          </button>

          <button
            onClick={() => setShowInviteModal(false)}
            className="w-full text-sm text-brand-400
                       hover:text-brand-600 transition text-center"
          >
            Cancel
          </button>

        </Modal>
      )}
    </div>
  )
}