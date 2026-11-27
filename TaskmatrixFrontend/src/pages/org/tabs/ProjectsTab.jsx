import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/Badge'

export default function ProjectsTab({ projects }) {
  const navigate = useNavigate()

  if (projects.length === 0) return (
    <div className="flex flex-col items-center justify-center
                    py-16 text-center bg-white rounded-2xl
                    border border-brand-100">
      <div className="w-12 h-12 bg-brand-50 rounded-2xl
                      flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-brand-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0
               00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-brand-800">
        No projects yet
      </p>
      <p className="text-xs text-brand-400 mt-1">
        Projects in this organisation will appear here
      </p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-brand-100
                    shadow-sm overflow-hidden">
      {projects.map((project, idx) => (
        <div key={project.id}
          className={`flex items-center gap-4 px-5 py-4
                      hover:bg-brand-50 transition
                      ${idx !== projects.length - 1
                        ? 'border-b border-brand-50' : ''}`}>

          {/* icon */}
          <div className="w-9 h-9 bg-brand-50 rounded-xl
                          flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-brand-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0
                   00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>

          {/* name + leader */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-900 truncate">
              {project.name}
            </p>
            <p className="text-xs text-brand-400 truncate">
              {project.projectLeaderName || 'No leader assigned'}
              {project.totalTasks > 0 && ` · ${project.totalTasks} tasks`}
            </p>
          </div>

          <Badge label={project.status} />

          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            className="px-3 py-1.5 text-xs font-semibold
                       border border-brand-200 text-brand-600
                       rounded-lg hover:bg-brand-50 transition
                       shrink-0"
          >
            View
          </button>
        </div>
      ))}
    </div>
  )
}