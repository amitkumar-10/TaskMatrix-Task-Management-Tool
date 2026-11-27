export default function Badge({ label }) {
  const styles = {
    ADMIN:          'bg-brand-500 text-white',
    PROJECT_LEADER: 'bg-amber-100 text-amber-700',
    MEMBER:         'bg-gray-100 text-gray-500',
    ACTIVE:         'bg-green-100 text-green-700',
    ON_HOLD:        'bg-amber-100 text-amber-700',
    COMPLETED:      'bg-brand-100 text-brand-700',
    CANCELLED:      'bg-red-100 text-red-500',
    PENDING:        'bg-yellow-100 text-yellow-700',
    ACCEPTED:       'bg-green-100 text-green-700',
    EXPIRED:        'bg-red-100 text-red-400',
    PUBLIC:         'bg-green-100 text-green-700',
    PRIVATE:        'bg-gray-100 text-gray-500',
  }

  const display = {
    PROJECT_LEADER: 'Project Leader',
    ON_HOLD:        'On Hold',
  }

  if (!label) return null

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${styles[label] || 'bg-gray-100 text-gray-500'}`}>
      {display[label] || label.charAt(0) + label.slice(1).toLowerCase()}
    </span>
  )
}