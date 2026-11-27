import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchInOrg } from '../api/searchApi'
import logo from '../assets/logo.png'
import NotificationBell from './NotificationBell'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Organisations',
    path: '/organisations',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6 l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: 'My Tasks',
    path: '/my-tasks',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Workspace',
    path: '/workspace',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14 a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Ref container for tracking outside clicks
  const searchRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Effect 1: Handle closing search results when clicking anywhere outside the search container
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Effect 2: Debounced real-time search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setShowResults(false)
      return
    }

    const currentOrgId = localStorage.getItem('currentOrgId')
    if (!currentOrgId) {
      return
    }

    setSearching(true)
    
    // Wait 300ms after the user stops typing to trigger the request
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchInOrg(currentOrgId, searchQuery)
        setSearchResults(res.data)
        setShowResults(true)
      } catch (err) {
        console.error('Search request failed:', err)
        setSearchResults(null)
      } finally {
        setSearching(false)
      }
    }, 300)

    // Clear timeout if user types again within 300ms
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Prevent standard form submission reload
  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  const handleNewOrg = () => {
    navigate('/organisations', { state: { openModal: true } })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">

      {/* ── Topbar ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-brand-100 px-4 py-3 flex items-center gap-4 shrink-0 z-10">

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-brand-400 hover:text-brand-600 transition p-1.5 rounded-lg hover:bg-brand-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="TaskMatrix Logo" className="h-10 w-auto" />
        </div>

        {/* Global Search Container */}
        <div ref={searchRef} className="flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleFormSubmit}>
            <div className="relative">
              {searching ? (
                <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin absolute left-3 top-1/2 -translate-y-1/2" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                type="text"
                placeholder="Search projects, tasks, members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && searchResults && setShowResults(true)}
                className="w-full pl-9 pr-4 py-2 bg-brand-50 rounded-xl text-sm text-brand-800 placeholder-brand-300 outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults && (
            <div className="absolute top-11 left-0 right-0 bg-white rounded-2xl shadow-xl border border-brand-100 z-50 max-h-96 overflow-y-auto">

              {searchResults.totalResults === 0 ? (
                <p className="text-sm text-brand-400 text-center py-6">
                  No results for "{searchQuery}"
                </p>
              ) : (
                <div className="p-2">

                  {/* Projects */}
                  {searchResults.projects?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-brand-300 px-3 py-1.5 uppercase tracking-wide">
                        Projects
                      </p>
                      {searchResults.projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`/projects/${p.id}`)
                            setShowResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 transition text-left"
                        >
                          <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brand-900">{p.name}</p>
                            <p className="text-xs text-brand-400">{p.status}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tasks */}
                  {searchResults.tasks?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-brand-300 px-3 py-1.5 uppercase tracking-wide">
                        Tasks
                      </p>
                      {searchResults.tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            navigate(`/projects/${t.projectId}`)
                            setShowResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 transition text-left"
                        >
                          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brand-900">{t.title}</p>
                            <p className="text-xs text-brand-400">{t.status} · {t.priority}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Members */}
                  {searchResults.members?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-brand-300 px-3 py-1.5 uppercase tracking-wide">
                        Members
                      </p>
                      {searchResults.members.map((m) => (
                        <div key={m.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 transition">
                          <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-600">
                            {m.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brand-900">{m.name}</p>
                            <p className="text-xs text-brand-400">{m.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* New Organisation Button */}
        <button
          onClick={handleNewOrg}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Organisation
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notification Bell */}

            <NotificationBell />

          {/* User Avatar */}
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-600 cursor-pointer border border-brand-200">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-0'} bg-white border-r border-brand-100 flex flex-col transition-all duration-200 overflow-hidden shrink-0`}>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    isActive ? 'bg-brand-500 text-white' : 'text-brand-400 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Meta Footer */}
          <div className="px-2 py-4 border-t border-brand-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-600 shrink-0 border border-brand-200">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-900 truncate">{user?.name}</p>
                <p className="text-xs text-brand-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition w-full whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  )
}