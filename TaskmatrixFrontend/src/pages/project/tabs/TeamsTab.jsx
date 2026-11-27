import { useState, useEffect } from 'react'
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
} from '../../../api/teamApi'
import Modal from '../../../components/Modal'

export default function TeamsTab({
  projectId,
  orgId,
  teams,
  members,
  isAdminOrLeader,
  onRefresh,
  // controlled from ProjectDetail
  showCreateModal,
  setShowCreateModal,
}) {
  const [showAddMemberModal, setShowAddMemberModal] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editTeam, setEditTeam] = useState(null)
  const [editName, setEditName] = useState('')

  // reset form when modal closes
  useEffect(() => {
    if (!showCreateModal) {
      setTeamName('')
    }
  }, [showCreateModal])

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    setLoading(true)
    try {
      await createTeam({ projectId, name: teamName })
      setTeamName('')
      setShowCreateModal(false)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      await addTeamMember({ teamId: showAddMemberModal, userId: selectedUser })
      setSelectedUser('')
      setShowAddMemberModal(null)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Delete this team?')) return
    try {
      await deleteTeam(teamId)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete team.')
    }
  }

  const handleEditTeam = async () => {
    if (!editName.trim()) return
    try {
      await updateTeam(editTeam.id, { name: editName })
      setEditTeam(null)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update team.')
    }
  }

  return (
    <div>
      {/* Create Team button (inside Teams tab) */}
      {isAdminOrLeader && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Team
          </button>
        </div>
      )}

      {/* Empty state */}
      {teams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-brand-100">
          <p className="text-sm font-semibold text-brand-800">No teams yet</p>
          <p className="text-xs text-brand-400 mt-1">
            Create a team to group members by function
          </p>
        </div>
      )}

      {/* Teams grid */}
      {teams.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm relative"
            >
              {/* 3-dot menu */}
              {isAdminOrLeader && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === team.id ? null : team.id)
                    }
                    className="p-1 text-brand-300 hover:text-brand-600 rounded-lg transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  {openMenu === team.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-brand-100 z-20 w-44 py-1">
                      <button
                        onClick={() => {
                          setEditTeam(team)
                          setEditName(team.name)
                          setOpenMenu(null)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition"
                      >
                        Edit team name
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteTeam(team.id)
                          setOpenMenu(null)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        Delete team
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h3 className="font-bold text-brand-900 text-base mb-1">
                {team.name}
              </h3>
              <p className="text-xs text-brand-400 mb-3">
                {team.totalMembers || 0} members
              </p>

              {/* member avatars placeholder */}
              <div className="flex mb-4" />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddMemberModal(team.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-brand-200 text-brand-600 rounded-xl hover:bg-brand-50 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Add Member
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition">
                  View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== CREATE TEAM MODAL ========== */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <button
            onClick={() => setShowCreateModal(false)}
            className="absolute top-4 right-4 text-brand-300 hover:text-brand-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-brand-900 mb-1">Create Team</h2>
          <p className="text-sm text-brand-400 mb-5">
            Organise members into a working group
          </p>

          <label className="block text-sm font-bold text-brand-800 mb-1">
            Team Name
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Design"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-50 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition mb-5"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2.5 border border-brand-200 text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTeam}
              disabled={loading || !teamName.trim()}
              className="flex-1 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {/* ========== EDIT TEAM MODAL ========== */}
      {editTeam && (
        <Modal onClose={() => setEditTeam(null)}>
          <h2 className="text-xl font-bold text-brand-900 mb-5">
            Edit Team Name
          </h2>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-50 text-sm outline-none focus:ring-2 focus:ring-brand-400 mb-5"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setEditTeam(null)}
              className="flex-1 py-2.5 border border-brand-200 text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEditTeam}
              className="flex-1 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ========== ADD MEMBER MODAL ========== */}
      {showAddMemberModal && (
        <Modal onClose={() => setShowAddMemberModal(null)}>
          <h2 className="text-xl font-bold text-brand-900 mb-1">
            Add Member to Team
          </h2>
          <p className="text-sm text-brand-400 mb-5">
            Choose from organisation members
          </p>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-50 text-sm outline-none focus:ring-2 focus:ring-brand-400 text-brand-600 mb-5"
          >
            <option value="">Select a member</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddMemberModal(null)}
              className="flex-1 py-2.5 border border-brand-200 text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={loading || !selectedUser}
              className="flex-1 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition disabled:opacity-60"
            >
              Add Member
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}