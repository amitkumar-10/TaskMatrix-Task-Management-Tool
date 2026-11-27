import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyResetOtp, forgotPassword } from '../../api/authApi'

export default function VerifyResetOtp() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email

  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer]     = useState(270)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const interval = setInterval(() =>
      setTimer((prev) => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const formatTimer = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0')
    const s = (timer % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasted)) return
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await verifyResetOtp({ email, otp: code })
      const resetToken = res.data.resetToken
      // pass resetToken + email to reset password screen
      navigate('/reset-password', {
        state: { resetToken, email }
      })
    } catch (err) {
      setError(
        err.response?.data?.error || 'Invalid OTP. Try again.'
      )
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setError('')
    setSuccess('')
    try {
      await forgotPassword({ email })
      setSuccess('A new reset code has been sent.')
      setOtp(['', '', '', '', '', ''])
      setTimer(270)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to resend code.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl
                      shadow-md p-8 text-center">

        {/* icon */}
        <div className="w-16 h-16 bg-brand-50 rounded-2xl
                        flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-indigo-600"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
                 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
                 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Enter otp to reset your password
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm
                          rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm
                          rounded-xl px-4 py-3 mb-4">
            {success}
          </div>
        )}

        {/* OTP boxes */}
        <div className="flex gap-3 justify-center mb-6"
             onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-12 text-center text-xl font-bold
                          border rounded-xl outline-none transition
                          focus:ring-2 focus:ring-brand-400
                          ${digit
                            ? 'border-brand-400 bg-brand-50'
                            : 'border-gray-200'}`}
            />
          ))}
        </div>

        {/* verify button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600
                     text-white font-semibold rounded-full transition
                     disabled:opacity-60 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white
                            border-t-transparent rounded-full
                            animate-spin" />
          )}
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {/* resend */}
        <p className="text-sm text-gray-500 mt-4">
          Didn't receive it?{' '}
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-brand-500 font-semibold hover:underline"
            >
              Resend code
            </button>
          ) : (
            <span className="text-gray-400">
              Resend in{' '}
              <span className="text-brand-500 font-semibold">
                {formatTimer()}
              </span>
            </span>
          )}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Code expires in 5 minutes
        </p>

        <Link to="/login"
          className="inline-flex items-center gap-1 text-sm
                     text-gray-500 hover:text-gray-700 mt-4">
          ← Back to login
        </Link>

      </div>
    </div>
  )
}