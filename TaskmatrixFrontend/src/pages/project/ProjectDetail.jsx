import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../../api/projectApi'
import { getProjectTeams } from '../../api/teamApi'
import { getProjectTasks } from '../../api/taskApi'
import { getOrgMembers } from '../../api/orgApi'
import { getProjectDashboard } from '../../api/dashboardApi'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/Badge'
import TeamsTab from './tabs/TeamsTab'
import TasksTab from './tabs/TasksTab'
import OverviewTab from './tabs/OverviewTab'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [activeTab, setActiveTab] = useState('Tasks')
  const [loading, setLoading] = useState(true)

  // NEW: control Create Team modal from here
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)

  const isLeader =
  project?.projectLeaderId === user?.userId ||
  project?.createdBy === user?.userId

  const isAdminOrLeader = isLeader

  useEffect(() => {
    fetchAll()
  }, [projectId])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [projRes, teamsRes, tasksRes] = await Promise.all([
        getProject(projectId),
        getProjectTeams(projectId),
        getProjectTasks(projectId),
      ])

      setProject(projRes.data)
      setTeams(teamsRes.data)
      setTasks(tasksRes.data)

      localStorage.setItem('currentOrgId', projRes.data.orgId)

      const membersRes = await getOrgMembers(projRes.data.orgId)
      setMembers(membersRes.data)

      const dashRes = await getProjectDashboard(projectId).catch(() => null)
      setDashboard(dashRes?.data || null)
    } catch {
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  // progress stats
  const taskCounts = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  }

  const totalTasks = tasks.length
  const doneTasks = taskCounts.DONE
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const isOverdue = project?.endDate && new Date(project.endDate) < new Date()

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-600 transition mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      {/* ========== PROJECT HEADER ========== */}
      <div className="bg-white rounded-2xl border border-brand-100 p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-brand-900 mb-1">
                {project?.name}
              </h1>

              <div className="flex items-center gap-1.5 text-sm text-brand-400 mb-2">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {project?.orgName || '—'}
              </div>

              <div className="flex gap-2 mb-2">
                <Badge label={project?.status} />
                <Badge label={project?.visibility} />
              </div>

              <div className="flex items-center gap-4 text-sm">
                {project?.projectLeaderName && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-600">
                      {getInitials(project.projectLeaderName)}
                    </div>
                    <span className="text-brand-600 font-medium">
                      {project.projectLeaderName}
                    </span>
                  </div>
                )}

                {project?.endDate && (
                  <div
                    className={`flex items-center gap-1.5 text-sm ${
                      isOverdue ? 'text-red-500' : 'text-brand-400'
                    }`}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Due {formatDate(project.endDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isAdminOrLeader && (
            <div className="flex gap-2">
              {/* THIS BUTTON NOW OPENS THE CREATE TEAM MODAL */}
              <button
                onClick={() => {
                  setActiveTab('Teams')
                  setShowCreateTeamModal(true)
                }}
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
                New Team
              </button>

              <button className="flex items-center gap-2 px-4 py-2 border border-brand-200 text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition">
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== OVERALL PROGRESS ========== */}
      <div className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-brand-900">Overall Progress</span>
          <span className="text-sm font-bold text-brand-500">{progress}%</span>
        </div>

        <div className="w-full bg-brand-100 rounded-full h-2.5 mb-3">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-5 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-brand-400">{taskCounts.TODO}</span>
            <span className="text-brand-400">Todo</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-brand-400">{taskCounts.IN_PROGRESS}</span>
            <span className="text-brand-400">In Progress</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-brand-400">{taskCounts.IN_REVIEW}</span>
            <span className="text-brand-400">In Review</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-brand-400">{taskCounts.DONE}</span>
            <span className="text-brand-400">Done</span>
          </span>
        </div>
      </div>

      {/* ========== TABS ========== */}
      <div className="flex gap-6 border-b border-brand-100 mb-4">
        {['Teams', 'Tasks', 'Overview'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-brand-300 hover:text-brand-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ========== TAB CONTENT ========== */}
      {activeTab === 'Teams' && (
        <TeamsTab
          projectId={projectId}
          orgId={project?.orgId}
          teams={teams}
          members={members}
          isAdminOrLeader={isAdminOrLeader}
          onRefresh={fetchAll}
          // NEW props to control the modal
          showCreateModal={showCreateTeamModal}
          setShowCreateModal={setShowCreateTeamModal}
        />
      )}

      {activeTab === 'Tasks' && (
        <TasksTab
          projectId={projectId}
          tasks={tasks}
          teams={teams}
          members={members}
          currentUserId={user?.userId}
          isAdminOrLeader={isAdminOrLeader}
          onRefresh={fetchAll}
        />
      )}

      {activeTab === 'Overview' && (
        <OverviewTab
          tasks={tasks}
          teams={teams}
          dashboard={dashboard}
        />
      )}
    </div>
  )
}