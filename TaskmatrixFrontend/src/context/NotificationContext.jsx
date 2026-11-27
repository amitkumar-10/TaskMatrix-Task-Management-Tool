import {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react'
import { Client } from '@stomp/stompjs'
import { useAuth } from './AuthContext'
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from '../api/notificationApi'
import { NotificationIcon } from '../components/NotificationParts'

const NotificationContext = createContext(null)

// SockJS endpoint also exposes a raw WebSocket at /ws/websocket
// use wss:// when you deploy
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'
// http becomes ws, https becomes wss automatically
const WS_URL = API.replace(/^http/, 'ws') + '/ws/websocket'

export function NotificationProvider({ children }) {
  const { token, isLoggedIn } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]     = useState(false)
  const [connected, setConnected] = useState(false)
  const [toasts, setToasts]       = useState([])

  const dismissToast = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id))

  const addToast = useCallback((n) => {
    setToasts((t) => [...t, n])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), 4000)
  }, [])

  // ── initial load ────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) { setNotifications([]); return }
    let cancelled = false
    setLoading(true)
    getNotifications()
      .then((res) => { if (!cancelled) setNotifications(res.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isLoggedIn, token])

  // ── live updates ────────────────────────────────────────────
  useEffect(() => {
    if (!token) return

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/notifications', (frame) => {
          const n = JSON.parse(frame.body)
          setNotifications((prev) =>
            prev.some((x) => x.id === n.id) ? prev : [n, ...prev]
          )
          addToast(n)
        })
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) =>
        console.warn('STOMP error:', frame.headers?.message),
    })

    client.activate()
    return () => { client.deactivate(); setConnected(false) }
  }, [token, addToast])

  // ── actions ─────────────────────────────────────────────────
  const markAsRead = async (id) => {
    const target = notifications.find((n) => n.id === id)
    if (!target || target.read) return

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    try {
      await apiMarkAsRead(id)
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      )
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await apiMarkAllAsRead()
    } catch {
      getNotifications().then((res) => setNotifications(res.data))
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, connected,
      markAsRead, markAllAsRead,
    }}>
      {children}

      {/* live toasts */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-3">
        {toasts.map((t) => (
          <div key={t.id}
            className="animate-toast-in relative w-[360px] bg-white
                       rounded-2xl shadow-xl border border-brand-100
                       p-4 pr-10 overflow-hidden">
            <div className="flex gap-3">
              <NotificationIcon notification={t} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-brand-900">{t.title}</p>
                <p className="text-sm text-brand-400 mt-0.5 line-clamp-2">
                  {t.message}
                </p>
              </div>
            </div>
            <button onClick={() => dismissToast(t.id)}
              className="absolute top-3 right-3 text-brand-300
                         hover:text-brand-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="toast-progress absolute bottom-0 left-0
                            h-1 bg-brand-500" />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider')
  }
  return ctx
}