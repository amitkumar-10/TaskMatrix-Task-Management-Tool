import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { NotificationIcon, timeAgo, goToNotification }
  from '../components/NotificationParts'

export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications, unreadCount, loading, connected,
    markAsRead, markAllAsRead,
  } = useNotifications()

  const [tab, setTab] = useState('ALL')

  const list = tab === 'UNREAD'
    ? notifications.filter((n) => !n.read)
    : notifications

  const handleOpen = (n) => {
    markAsRead(n.id)
    goToNotification(n, navigate)
  }

  const tabs = [
    { key: 'ALL',    label: 'All',    count: notifications.length },
    { key: 'UNREAD', label: 'Unread', count: unreadCount },
  ]

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold
                          tracking-widest text-brand-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                   6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
                   6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
                   0 11-6 0v-1m6 0H9" />
            </svg>
            ACTIVITY CENTRE
          </div>
          <h1 className="text-3xl font-bold text-brand-900">Notifications</h1>
          <p className="text-sm text-brand-400 mt-1">
            Stay on top of tasks and team activity
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-5 py-3 bg-white border
                     border-brand-100 shadow-sm text-brand-600 text-sm
                     font-semibold rounded-full hover:bg-brand-50 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark all as read
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-2 border-b border-brand-100 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium
                        border-b-2 -mb-px transition
                        ${tab === t.key
                          ? 'border-brand-500 text-brand-600'
                          : 'border-transparent text-brand-400 hover:text-brand-600'}`}
          >
            {t.label}
            <span className="text-xs bg-brand-100 text-brand-500
                             rounded-full px-2 py-0.5">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500
                          border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* empty */}
      {!loading && list.length === 0 && (
        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm flex flex-col items-center py-24">
          <div className="relative w-16 h-16 bg-brand-50 rounded-2xl
                          flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-brand-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                   6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
                   6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
                   0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full
                             bg-brand-500" />
          </div>
          <h2 className="text-base font-bold text-brand-900">
            You're all caught up
          </h2>
          <p className="text-sm text-brand-400 mt-1">
            New activity will show up here
          </p>
        </div>
      )}

      {/* list */}
      {!loading && list.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-100
                        shadow-sm overflow-hidden">
          {list.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`w-full text-left flex items-start gap-4 px-6 py-5
                          border-b border-brand-50 last:border-0 transition
                          hover:bg-brand-50
                          ${n.read ? 'bg-white' : 'bg-brand-50'}`}
            >
              <NotificationIcon notification={n} />

              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-900">{n.title}</p>
                <p className="text-sm text-brand-400 mt-1">{n.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-sm
                              text-brand-400">
                {timeAgo(n.createdAt)}
                {!n.read && (
                  <span className="w-5 h-5 rounded-full bg-brand-100
                                   flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* footer */}
      {!loading && list.length > 0 && (
        <div className="flex items-center justify-between text-sm
                        text-brand-300 mt-4 px-1">
          <span>
            {list.length} notification{list.length === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full
                              ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
            {connected ? 'Live updates on' : 'Offline'}
          </span>
        </div>
      )}
    </div>
  )
}