export const PRIORITY_STYLES = {
  LOW:      'bg-green-100 text-green-700',
  MEDIUM:   'bg-yellow-100 text-yellow-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-600',
}

export const PRIORITY_RANK = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

export const STATUS_META = {
  TODO:        { label: 'To Do',       pill: 'bg-gray-100 text-gray-600',   color: '#C8C3D6' },
  IN_PROGRESS: { label: 'In Progress', pill: 'bg-blue-100 text-blue-600',   color: '#6F95CB' },
  IN_REVIEW:   { label: 'In Review',   pill: 'bg-amber-100 text-amber-700', color: '#D6A843' },
  DONE:        { label: 'Done',        pill: 'bg-green-100 text-green-700', color: '#5FA67B' },
}

export const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : ''

// overdue = due before today (due today is not overdue) and not done
export const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'DONE') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(task.dueDate) < today
}

export const dueTime = (task) =>
  task.dueDate ? new Date(task.dueDate).getTime() : Number.MAX_SAFE_INTEGER