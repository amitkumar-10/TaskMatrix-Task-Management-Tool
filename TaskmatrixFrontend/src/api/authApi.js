import axiosInstance from './axiosInstance'

// Signup 
export const signup = (data) =>
  axiosInstance.post('/auth/register', data)

// Verify email OTP 
export const verifyEmail = (data) =>
  axiosInstance.post('/auth/verify-email', data)

//  Resend OTP 
export const resendOtp = (data) =>
  axiosInstance.post('/auth/resend-otp', data)

// Login 
export const login = (data) =>
  axiosInstance.post('/auth/login', data)

// Forgot password 
export const forgotPassword = (data) =>
  axiosInstance.post('/auth/forgot-password', data)

// Verify reset OTP 
export const verifyResetOtp = (data) =>
  axiosInstance.post('/auth/verify-reset-otp', data)

// Reset password 
export const resetPassword = (data) =>
  axiosInstance.post('/auth/reset-password', data)