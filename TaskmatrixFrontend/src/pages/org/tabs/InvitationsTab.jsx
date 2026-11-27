import { useState } from 'react'
import { cancelInvitation, resendInvitation } from '../../../api/invitationApi'
import Badge from '../../../components/Badge'

export default function InvitationsTab({
  invitations, isAdmin, orgId, onRefresh
}) {
  const [loading, setLoading] = useState(null)

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const handleCancel = async (id) => {
    setLoading(id)
    try {
      await cancelInvitation(id)
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel.')
    } finally {
      setLoading(null)
    }
  }

  const handleResend = async (id) => {
    setLoading(id + '-resend')
    try {
      await resendInvitation(id)
      alert('Invitation resent successfully.')
      onRefresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resend.')
    } finally {
      setLoading(null)
    }
  }

  if (invitations.length === 0) return (
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
               2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
               2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-brand-800">
        No pending invitations
      </p>
      <p className="text-xs text-brand-400 mt-1">
        Invited members will appear here
      </p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-brand-100
                    shadow-sm overflow-hidden">
      {invitations.map((inv, idx) => (
        <div key={inv.id}
          className={`flex items-center gap-4 px-5 py-4
                      hover:bg-brand-50 transition
                      ${idx !== invitations.length - 1
                        ? 'border-b border-brand-50' : ''}`}>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-900">
              {inv.invitedEmail}
            </p>
            <p className="text-xs text-brand-300 flex items-center gap-1 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sent {formatDate(inv.createdAt)}
            </p>
          </div>

          <Badge label={inv.status?.toUpperCase()} />

          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => handleResend(inv.id)}
                disabled={loading === inv.id + '-resend'}
                className="px-3 py-1.5 text-xs font-semibold
                           border border-brand-200 text-brand-600
                           rounded-lg hover:bg-brand-50 transition
                           disabled:opacity-50"
              >
                Resend
              </button>
              <button
                onClick={() => handleCancel(inv.id)}
                disabled={loading === inv.id}
                className="px-3 py-1.5 text-xs font-semibold
                           border border-red-200 text-red-500
                           rounded-lg hover:bg-red-50 transition
                           disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}