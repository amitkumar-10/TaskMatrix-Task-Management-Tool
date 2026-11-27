import axiosInstance from './axiosInstance'

export const searchInOrg = (orgId, query) =>
  axiosInstance.get(`/search/org/${orgId}?q=${query}`)

export const searchTasksInProject = (projectId, query) =>
  axiosInstance.get(`/search/project/${projectId}/tasks?q=${query}`)