import axiosInstance from './axiosInstance'

export const getOrgDashboard = (orgId) =>
  axiosInstance.get(`/dashboard/org/${orgId}`)

export const getProjectDashboard = (projectId) =>
  axiosInstance.get(`/dashboard/project/${projectId}`)

export const getMemberDashboard = (orgId, targetUserId) =>
  axiosInstance.get(`/dashboard/member/${orgId}/${targetUserId}`)

export const getMyDashboard = (orgId) =>
  axiosInstance.get(`/dashboard/member/${orgId}/me`)