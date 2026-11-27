import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate         = useNavigate()
  const location         = useLocation()
  const { saveAuth }     = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const inviteEmail = location.state?.email

  // pre-fill email field
  useEffect(() => {
    if (inviteEmail) {
      setValue('email', inviteEmail)
    }
  }, [inviteEmail, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await login({ email: data.email, password: data.password })
      const { token, ...userData } = res.data
      saveAuth(token, userData)

      // check if there's a redirect from invite flow
      const redirectTo = location.state?.redirectTo
      if (redirectTo) {
        navigate(redirectTo, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const message = err.response?.data?.error || ''

      // email not verified → redirect to OTP page
      if (message === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-otp', { state: { email: data.email } })
        return
      }

      setError(message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center
                    justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl
                      shadow-md p-8">

        {/* logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-brand-500 rounded-xl
                          flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h8M4 18h8" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">
            TaskMatrix
          </span>
        </div>

        {/* heading */}
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Sign in to continue to TaskMatrix
        </p>

        {/* error banner */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl
                          px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="alex@company.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm
                          outline-none transition
                          focus:ring-2 focus:ring-brand-400
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-gray-800">
                Password
              </label>
              <Link to="/forgot-password"
                className="text-sm text-brand-500 font-semibold
                           hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-11 rounded-xl border
                            text-sm outline-none transition
                            focus:ring-2 focus:ring-brand-400
                            ${errors.password
                              ? 'border-red-400'
                              : 'border-gray-200'}`}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                         0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029
                         m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242
                         4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29
                         3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5
                         c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0
                         01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                         8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                         7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
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
                       flex items-center justify-center gap-2 mt-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full
                              animate-spin" />
            )}
            {loading ? 'Signing in...' : 'Log in'}
          </button>

        </form>

        {/* divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* OAuth buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center
                             gap-2 py-3 border border-gray-200
                             rounded-xl text-sm font-medium
                             text-gray-700 hover:bg-gray-50 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92
                   c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92
                   3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66
                   -2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18
                   v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43
                   .35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45
                   1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45
                   2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66
                   2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button className="flex-1 flex items-center justify-center
                             gap-2 py-3 border border-gray-200
                             rounded-xl text-sm font-medium
                             text-gray-700 hover:bg-gray-50 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795
                       8.205 11.385.6.105.825-.255.825-.57 0-.285
                       -.015-1.23-.015-2.235-3.015.555-3.795-.735
                       -4.035-1.41-.135-.345-.72-1.41-1.23-1.695
                       -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87
                       1.845 1.23.255.435 1.095.69 2.46.48.09-.78.36
                       -.885.63-1.095-1.95-.225-3.99-.975-3.99-4.335
                       0-.96.345-1.74.9-2.355-.09-.225-.39-1.11.09
                       -2.31 0 0 .735-.225 2.415.9a8.456 8.456 0
                       012.19-.3c.745.005 1.49.1 2.19.3 1.68-1.14
                       2.415-.9 2.415-.9.48 1.2.18 2.085.09 2.31
                       .555.615.9 1.38.9 2.355 0 3.375-2.055 4.11
                       -4.005 4.335.315.27.585.795.585 1.605 0 1.155
                       -.015 2.1-.015 2.385 0 .315.225.69.825.57A12.02
                       12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup"
            className="text-brand-500 font-semibold hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}