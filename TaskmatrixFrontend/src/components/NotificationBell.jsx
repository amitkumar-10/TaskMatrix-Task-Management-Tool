import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { NotificationIcon, timeAgo, goToNotification }
  from './NotificationParts'

export default function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()
  const [open, setOpen] = useState(false)

  const recent = notifications.slice(0, 5)

  const handleOpen = (n) => {
    markAsRead(n.id)
    goToNotification(n, navigate)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 flex items-center justify-center
                   rounded-full bg-white border border-brand-100
                   shadow-sm text-brand-500 hover:bg-brand-50 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
               6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
               0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1
                           bg-red-500 text-white text-[11px] font-bold
                           rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-12 z-40 w-[380px] bg-white
                          rounded-2xl shadow-xl border border-brand-100
                          overflow-hidden">

            {/* header */}
            <div className="flex items-start justify-between px-5 py-4
                            border-b border-brand-50">
              <div>
                <p className="font-bold text-brand-900">Notifications</p>
                <p className="text-xs text-brand-400 mt-0.5">
                  {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-semibold text-brand-500
                           hover:text-brand-700 transition
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
            </div>

            {/* list */}
            <div className="max-h-96 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="text-sm text-brand-400 text-center py-10">
                  You're all caught up
                </p>
              ) : (
                recent.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleOpen(n)}
                    className={`w-full text-left flex gap-3 px-5 py-4
                                border-b border-brand-50 last:border-0
                                transition hover:bg-brand-50
                                ${n.read ? 'bg-white' : 'bg-brand-50'}`}
                  >
                    <NotificationIcon notification={n} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-brand-900 truncate">
                          {n.title}
                        </p>
                        <span className="flex items-center gap-1.5 shrink-0
                                         text-xs text-brand-400">
                          {timeAgo(n.createdAt)}
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-brand-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* footer */}
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="w-full py-3.5 text-sm font-medium text-brand-500
                         border-t border-brand-100 hover:bg-brand-50
                         transition"
            >
              View all
            </button>
          </div>
        </>
      )}
    </div>
  )
}