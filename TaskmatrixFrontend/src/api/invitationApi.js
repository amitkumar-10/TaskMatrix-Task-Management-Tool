import axiosInstance from './axiosInstance'

export const sendInvitation = (data) =>
  axiosInstance.post('/invitation/send', data)

export const checkInvitation = (token) =>
  axiosInstance.get(`/invitation/check?token=${token}`)

export const acceptInvitation = (data) =>
  axiosInstance.post('/invitation/accept', data)

export const getPendingInvitations = (orgId) =>
  axiosInstance.get(`/invitation/pending/${orgId}`)

export const cancelInvitation = (invitationId) =>
  axiosInstance.delete(`/invitation/cancel/${invitationId}`)

export const resendInvitation = (invitationId) =>
  axiosInstance.post(`/invitation/resend/${invitationId}`)