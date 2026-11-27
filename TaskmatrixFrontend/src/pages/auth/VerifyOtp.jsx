import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyEmail, resendOtp } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'

export default function VerifyOtp() {
  const navigate             = useNavigate()
  const location             = useLocation()
  const { saveAuth }         = useAuth()

  // email passed from signup page
  const email = location.state?.email

  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer]     = useState(270) // 4:30 countdown
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  // ── redirect if no email in state ───────────────────────────
  useEffect(() => {
    if (!email) navigate('/signup', { replace: true })
  }, [email, navigate])

  // ── countdown timer ──────────────────────────────────────────
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const formatTimer = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0')
    const s = (timer % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  //  handle OTP input 
  const handleChange = (index, value) => {
    // only allow single digit
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // take last char only
    setOtp(newOtp)

    // auto focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // ── handle backspace 
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // ── handle paste 
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasted)) return

    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char
    })
    setOtp(newOtp)
    // focus last filled box
    const lastIndex = Math.min(pasted.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  // ── verify OTP 
  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter valid otp.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await verifyEmail({ email, otp: code })
      const { token, ...userData } = res.data
      saveAuth(token, userData)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.')
      // clear OTP boxes on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // ── resend OTP 
  const handleResend = async () => {
    if (!canResend) return
    setError('')
    setSuccess('')
    try {
      await resendOtp({ email })
      setSuccess('A new code has been sent to your email.')
      setOtp(['', '', '', '', '', ''])
      setTimer(270)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center
                    justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl
                      shadow-md p-8 text-center">

        {/* icon */}
        <div className="w-16 h-16 bg-brand-50 rounded-2xl
                        flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-brand-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2
                 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2
                 2 0 002 2z" />
          </svg>
        </div>

        {/* heading */}
        <h1 className="text-2xl font-bold text-gray-900">
          Verify your email
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          We sent a 6-digit code to{' '}
          <span className="text-gray-700 font-medium">{email}</span>
        </p>

        {/* error / success banners */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl
                          px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm rounded-xl
                          px-4 py-3 mb-4">
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
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        {/* resend + timer */}
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

      </div>
    </div>
  )
}