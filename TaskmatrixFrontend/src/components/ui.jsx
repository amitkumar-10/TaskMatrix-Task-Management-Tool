export const ICONS = {
  target:     'M12 3a9 9 0 100 18 9 9 0 000-18z M12 9a3 3 0 100 6 3 3 0 000-6z',
  building:   'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  folder:     'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  clipboard:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  checkCircle:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  check:      'M5 13l4 4L19 7',
  warning:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  arrowRight: 'M17 8l4 4m0 0l-4 4m4-4H3',
  chevron:    'M19 9l-7 7-7-7',
  send:       'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  clock:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  play:       'M5 3l14 9-14 9V3z',
}

export function Icon({ d, className = 'w-5 h-5', filled = false }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        strokeWidth={1.8} d={d} />
    </svg>
  )
}

// rounded pill dropdown with a custom chevron
export function FilterSelect({ value, onChange, className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-5 pr-11 py-3 text-sm
                   font-semibold bg-white border border-brand-100
                   rounded-full shadow-sm text-brand-900 outline-none
                   focus:ring-2 focus:ring-brand-400 cursor-pointer"
      >
        {children}
      </select>
      <Icon d={ICONS.chevron}
        className="w-4 h-4 text-brand-400 absolute right-4 top-1/2
                   -translate-y-1/2 pointer-events-none" />
    </div>
  )
}