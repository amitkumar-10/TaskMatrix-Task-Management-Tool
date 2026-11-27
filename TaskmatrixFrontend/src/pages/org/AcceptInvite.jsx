import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { checkInvitation, acceptInvitation } from '../../api/invitationApi'
import { useAuth } from '../../context/AuthContext'

export default function AcceptInvite() {
  const [searchParams]      = useSearchParams()
  const navigate            = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const token = searchParams.get('token')

  const [invite, setInvite]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  // ── Step 1: check token on page load ────────────────────────
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link.')
      setLoading(false)
      return
    }
    checkToken()
  }, [token])

  const checkToken = async () => {
    try {
      const res = await checkInvitation(token)
      setInvite(res.data)
    } catch (err) {
      setError(
        err.response?.data?.error || 'Invalid or expired invitation.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: accept after login ───────────────────────────────
  const handleAccept = async () => {
    setAccepting(true)
    setError('')
    try {
      const res = await acceptInvitation({ token })
      setSuccess(true)
      // redirect to the org after 2 seconds
      setTimeout(() => {
        navigate(`/organisations/${res.data.id}`)
      }, 2000)
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to accept invitation.'
      )
    } finally {
      setAccepting(false)
    }
  }

  // ── Loading state ────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center">
      <div className="w-8 h-8 border-4 border-brand-500
                      border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Success state ────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md
                      w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl
                        flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-green-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand-900 mb-2">
          You're in! 🎉
        </h2>
        <p className="text-sm text-brand-400">
          You've joined <strong>{invite?.orgName}</strong>.
          Redirecting you now...
        </p>
      </div>
    </div>
  )

  // ── Error state (invalid/expired token) ─────────────────────
  if (error && !invite) return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md
                      w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl
                        flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand-900 mb-2">
          Invalid Invitation
        </h2>
        <p className="text-sm text-brand-400 mb-5">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 bg-brand-500 text-white text-sm
                     font-semibold rounded-xl hover:bg-brand-600
                     transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  )

  // ── Main invite card ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md
                      w-full text-center">

        {/* icon */}
        <div className="w-16 h-16 bg-brand-50 rounded-2xl
                        flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-brand-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2
                 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5
                 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-brand-900 mb-1">
          You're invited!
        </h1>
        <p className="text-sm text-brand-400 mb-1">
          You've been invited to join
        </p>
        <p className="text-lg font-bold text-brand-600 mb-5">
          {invite?.orgName}
        </p>

        {/* error banner */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm rounded-xl
                          px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* CASE 1 — user is logged in → accept directly */}
        {isLoggedIn ? (
          <div>
            <p className="text-sm text-brand-400 mb-5">
              Logged in as{' '}
              <strong className="text-brand-700">{user?.email}</strong>
            </p>

            {/* check email matches */}
            {user?.email !== invite?.invitedEmail ? (
              <div>
                <div className="bg-amber-50 text-amber-700 text-sm
                                rounded-xl px-4 py-3 mb-4">
                  This invitation was sent to{' '}
                  <strong>{invite?.invitedEmail}</strong>.
                  Please log in with that email.
                </div>
                <button
                  onClick={() => {
                    // logout and redirect to login
                    navigate('/login')
                  }}
                  className="w-full py-3 border border-brand-200
                             text-brand-600 text-sm font-semibold
                             rounded-xl hover:bg-brand-50 transition"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600
                           text-white text-sm font-semibold rounded-xl
                           transition disabled:opacity-60
                           flex items-center justify-center gap-2"
              >
                {accepting && (
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                )}
                {accepting ? 'Joining...' : `Join ${invite?.orgName}`}
              </button>
            )}
          </div>

        ) : (
          /* CASE 2 — user not logged in */
          <div>
            <p className="text-sm text-brand-400 mb-5">
              {invite?.isRegistered
                ? 'Please log in to accept this invitation.'
                : 'Please create an account to accept this invitation.'}
            </p>

            {invite?.isRegistered ? (
              /* already registered → go to login */
              <button
                onClick={() => navigate('/login', {
                  state: {
                    redirectTo: `/invite/accept?token=${token}`,
                    email: invite?.invitedEmail
                  }
                })}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600
                           text-white text-sm font-semibold rounded-xl
                           transition"
              >
                Log in to Accept
              </button>
            ) : (
              /* not registered → go to signup */
              <button
                onClick={() => navigate('/signup', {
                  state: {
                    redirectTo: `/invite/accept?token=${token}`,
                    email: invite?.invitedEmail
                  }
                })}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600
                           text-white text-sm font-semibold rounded-xl
                           transition"
              >
                Create Account to Accept
              </button>
            )}

            <p className="text-xs text-brand-300 mt-3">
              Use <strong>{invite?.invitedEmail}</strong> to sign up or log in
            </p>
          </div>
        )}

      </div>
    </div>
  )
}