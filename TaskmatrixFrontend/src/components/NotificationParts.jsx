import { getTask } from '../api/taskApi'

export function timeAgo(date) {
  if (!date) return ''
  const diff = Math.max(0, Date.now() - new Date(date).getTime())
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}

const PATHS = {
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  send:      'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  check:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  cross:     'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  warning:   'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  userAdd:   'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  userRemove:'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6',
  bell:      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
}

function getMeta(n) {
  switch (n.type) {
    case 'TASK_ASSIGNED':
      return { box: 'bg-brand-100 text-brand-600', path: PATHS.clipboard }
    case 'TASK_SUBMITTED':
      return { box: 'bg-amber-100 text-amber-600', path: PATHS.send }
    case 'TASK_REVIEWED': {
      const rejected = n.title?.toLowerCase().includes('changes')
      return rejected
        ? { box: 'bg-red-100 text-red-500',     path: PATHS.cross }
        : { box: 'bg-green-100 text-green-600', path: PATHS.check }
    }
    case 'TASK_DUE_SOON':
    case 'PROJECT_DUE_SOON':
      return { box: 'bg-orange-100 text-orange-600', path: PATHS.calendar }
    case 'TASK_UNASSIGNED':
      return { box: 'bg-orange-100 text-orange-600', path: PATHS.warning }
    case 'MEMBER_JOINED':
      return { box: 'bg-blue-100 text-blue-600', path: PATHS.userAdd }
    case 'MEMBER_LEFT':
      return { box: 'bg-blue-100 text-blue-600', path: PATHS.userRemove }
    default:
      return { box: 'bg-brand-100 text-brand-600', path: PATHS.bell }
  }
}

export function NotificationIcon({ notification, size = 'md' }) {
  const { box, path } = getMeta(notification)
  const boxCls  = size === 'sm' ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'
  const iconCls = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <div className={`${boxCls} ${box} flex items-center justify-center shrink-0`}>
      <svg xmlns="http://www.w3.org/2000/svg" className={iconCls}
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round"
          strokeWidth={1.8} d={path} />
      </svg>
    </div>
  )
}

// where should clicking a notification take you?
export async function goToNotification(n, navigate) {
  try {
    if (n.referenceType === 'ORG') {
      navigate(`/organisations/${n.referenceId}`)
    } else if (n.referenceType === 'PROJECT') {
      navigate(`/projects/${n.referenceId}`)
    } else if (n.referenceType === 'TASK') {
      const res = await getTask(n.referenceId)
      navigate(`/projects/${res.data.projectId}`)
    }
  } catch {
    // task deleted or no access, just stay put
  }
}