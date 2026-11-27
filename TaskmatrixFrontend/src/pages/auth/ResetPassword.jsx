import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { resetPassword } from '../../api/authApi'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()

  const resetToken = location.state?.resetToken
  const email      = location.state?.email

  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  // redirect if no resetToken
  if (!resetToken) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center
                      justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-2xl
                        shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            Invalid or expired reset link.
          </p>
          <Link to="/forgot-password"
            className="text-brand-500 font-semibold hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await resetPassword({
        resetToken,
        newPassword: data.newPassword,
      })
      navigate('/login', {
        state: { message: 'Password reset successful. Please log in.' }
      })
    } catch (err) {
      setError(
        err.response?.data?.error || 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show, toggle }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2
                 text-gray-400 hover:text-gray-600"
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
               0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029
               m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242
               4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
               M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0
               8.268 2.943 9.543 7a10.025 10.025 0 01-4.132
               5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
               8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
               7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02
                 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
                 5.176-1.332 9-6.03 9-11.622 0-1.042-.133
                 -2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Set new password
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Must be at least 8 characters
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm
                          rounded-xl px-4 py-3 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 text-left">

          {/* New Password */}
          <div>
            <label className="block text-sm font-bold
                               text-gray-800 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className={`w-full px-4 py-3 pr-11 rounded-xl
                            border text-sm outline-none transition
                            focus:ring-2 focus:ring-indigo-500
                            ${errors.newPassword
                              ? 'border-red-400'
                              : 'border-gray-200'}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Must be at least 8 characters',
                  },
                })}
              />
              <EyeIcon
                show={showNew}
                toggle={() => setShowNew(!showNew)}
              />
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold
                               text-gray-800 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                className={`w-full px-4 py-3 pr-11 rounded-xl
                            border text-sm outline-none transition
                            focus:ring-2 focus:ring-brand-400
                            ${errors.confirmPassword
                              ? 'border-red-400'
                              : 'border-gray-200'}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) =>
                    val === watch('newPassword') ||
                    'Passwords do not match',
                })}
              />
              <EyeIcon
                show={showConfirm}
                toggle={() => setShowConfirm(!showConfirm)}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-indigo-700
                       text-white font-semibold rounded-full transition
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full
                              animate-spin" />
            )}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

        </form>

      </div>
    </div>
  )
}