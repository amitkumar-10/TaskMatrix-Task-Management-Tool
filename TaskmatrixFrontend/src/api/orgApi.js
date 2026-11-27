import axiosInstance from './axiosInstance'

export const createOrg = (data) =>
  axiosInstance.post('/org/create', data)

export const getMyOrgs = () =>
  axiosInstance.get('/org/my')

export const getOrg = (orgId) =>
  axiosInstance.get(`/org/${orgId}`)

export const getOrgMembers = (orgId) =>
  axiosInstance.get(`/org/${orgId}/members`)

export const updateMemberRole = (orgId, data) =>
  axiosInstance.put(`/org/${orgId}/members/role`, data)

export const removeMember = (orgId, memberId) =>
  axiosInstance.delete(`/org/${orgId}/members/${memberId}`)

export const leaveOrg = (orgId) =>
  axiosInstance.delete(`/org/${orgId}/leave`)

export const transferAdmin = (orgId, newAdminMemberId) =>
  axiosInstance.put(`/org/${orgId}/transfer-admin/${newAdminMemberId}`)

