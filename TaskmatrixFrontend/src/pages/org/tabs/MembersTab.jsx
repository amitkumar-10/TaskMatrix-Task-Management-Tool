import { useState } from 'react'
import { updateMemberRole, removeMember } from '../../../api/orgApi'
import Badge from '../../../components/Badge'

export default function MembersTab({
  members, isAdmin, currentUserId, orgId, onRefresh
}) {
  const [search, setSearch]     = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [loading, setLoading]   = useState(false)

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric'
    })
  }

  const handleRoleChange = async (memberId, role) => {
    setLoading(true)
    try {
      await updateMemberRole(orgId, { memberId, role })
      setOpenMenu(null)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this member from the organisation?')) return
    setLoading(true)
    try {
      await removeMember(orgId, memberId)
      setOpenMenu(null)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* search */}
      <div className="relative mb-4">
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-brand-300 absolute left-3 top-1/2 -translate-y-1/2"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-brand-100 text-sm outline-none focus:ring-2 focus:ring-brand-400 transition"
        />
      </div>

      {/* members list — REMOVED overflow-hidden HERE */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm">
        {filtered.map((member, idx) => (
          <div 
            key={member.memberId}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-brand-50 transition relative 
                        first:rounded-t-2xl last:rounded-b-2xl
                        ${openMenu === member.memberId ? 'z-30' : 'z-10'}
                        ${idx !== filtered.length - 1 ? 'border-b border-brand-50' : ''}`}
          >

            {/* avatar */}
            <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
              {getInitials(member.name)}
            </div>

            {/* name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-900 truncate">
                {member.name}
                {member.userId === currentUserId && (
                  <span className="text-brand-300 font-normal ml-1">
                    (you)
                  </span>
                )}
              </p>
              <p className="text-xs text-brand-400 truncate">
                {member.email}
              </p>
            </div>

            {/* role badge */}
            <Badge label={member.role} />

            {/* joined date */}
            <span className="text-xs text-brand-300 shrink-0 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(member.joinedAt)}
            </span>

            {/* 3-dot menu — admin only, not for self */}
            {isAdmin && member.userId !== currentUserId && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(
                    openMenu === member.memberId ? null : member.memberId
                  )}
                  className="p-1 text-brand-300 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {openMenu === member.memberId && (
                  /* UPDATED: Increased z-index explicitly here as well just to be safe */
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-brand-100 z-50 w-48 py-1"
                       onClick={(e) => e.stopPropagation()}>

                    {member.role !== 'PROJECT_LEADER' && (
                      <button
                        onClick={() => handleRoleChange(member.memberId, 'PROJECT_LEADER')}
                        className="w-full text-left px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition"
                      >
                        Promote to Project Leader
                      </button>
                    )}
                    {member.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleRoleChange(member.memberId, 'ADMIN')}
                        className="w-full text-left px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition"
                      >
                        Promote to Admin
                      </button>
                    )}
                    {member.role !== 'MEMBER' && (
                      <button
                        onClick={() => handleRoleChange(member.memberId, 'MEMBER')}
                        className="w-full text-left px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition"
                      >
                        Demote to Member
                      </button>
                    )}
                    <div className="border-t border-brand-50 my-1" />
                    <button
                      onClick={() => handleRemove(member.memberId)}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      Remove from org
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}