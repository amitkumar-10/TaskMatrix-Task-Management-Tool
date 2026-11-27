import axiosInstance from './axiosInstance'

export const createProject = (data) =>
  axiosInstance.post('/project/create', data)

export const getOrgProjects = (orgId) =>
  axiosInstance.get(`/project/org/${orgId}`)

export const getProject = (projectId) =>
  axiosInstance.get(`/project/${projectId}`)

export const getProjectsByStatus = (orgId, status) =>
  axiosInstance.get(`/project/org/${orgId}/status/${status}`)

export const getMyProjects = (orgId) =>
  axiosInstance.get(`/project/org/${orgId}/my`)

export const updateProject = (projectId, data) =>
  axiosInstance.put(`/project/${projectId}`, data)

export const deleteProject = (projectId) =>
  axiosInstance.delete(`/project/${projectId}`)