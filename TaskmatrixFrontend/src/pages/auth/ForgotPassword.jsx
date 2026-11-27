import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { forgotPassword } from '../../api/authApi'

export default function ForgotPassword() {
  const navigate            = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await forgotPassword({ email: data.email })
      // pass email forward to OTP screen
      navigate('/verify-reset-otp', {
        state: { email: data.email }
      })
    } catch (err) {
      setError(
        err.response?.data?.error || 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center
                    justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl
                      shadow-md p-8 text-center">

        {/* icon */}
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl
                        flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-indigo-600"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0
                 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4
                 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* heading */}
        <h1 className="text-2xl font-bold text-gray-900">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Enter your email and we'll send you a reset code
        </p>

        {/* error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm
                          rounded-xl px-4 py-3 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 text-left">

          {/* Email */}
          <div>
            <label className="block text-sm font-bold
                               text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="alex@company.com"
              className={`w-full px-4 py-3 rounded-xl border
                          text-sm outline-none transition
                          focus:ring-2 focus:ring-indigo-500
                          ${errors.email
                            ? 'border-red-400'
                            : 'border-gray-200'}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
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
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

        </form>

        {/* back */}
        <Link to="/login"
          className="inline-flex items-center gap-1 text-sm
                     text-gray-500 hover:text-gray-700 mt-5">
          ← Back to login
        </Link>

      </div>
    </div>
  )
}