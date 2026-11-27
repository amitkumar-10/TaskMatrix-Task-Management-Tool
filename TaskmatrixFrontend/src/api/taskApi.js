import axiosInstance from './axiosInstance'

export const createTask = (data) =>
  axiosInstance.post('/task/create', data)

export const getTask = (taskId) =>
  axiosInstance.get(`/task/${taskId}`)

export const getProjectTasks = (projectId) =>
  axiosInstance.get(`/task/project/${projectId}`)

export const getTeamTasks = (teamId) =>
  axiosInstance.get(`/task/team/${teamId}`)

export const getMyTasks = (orgId) =>
  axiosInstance.get(`/task/my/${orgId}`)

export const getTasksByStatus = (projectId, status) =>
  axiosInstance.get(`/task/project/${projectId}/status/${status}`)

export const getUnassignedTasks = (projectId) =>
  axiosInstance.get(`/task/project/${projectId}/unassigned`)

export const getPendingReview = (projectId) =>
  axiosInstance.get(`/task/project/${projectId}/pending-review`)

export const assignTask = (taskId, data) =>
  axiosInstance.put(`/task/${taskId}/assign`, data)

export const unassignTask = (taskId) =>
  axiosInstance.put(`/task/${taskId}/unassign`)

export const updateTaskStatus = (taskId, data) =>
  axiosInstance.put(`/task/${taskId}/status`, data)

export const submitTask = (taskId, data) =>
  axiosInstance.post(`/task/${taskId}/submit`, data)

export const resubmitTask = (taskId, data) =>
  axiosInstance.post(`/task/${taskId}/resubmit`, data)

export const reviewTask = (taskId, data) =>
  axiosInstance.post(`/task/${taskId}/review`, data)

export const deleteTask = (taskId) =>
  axiosInstance.delete(`/task/${taskId}`)

export const rescheduleTask = (taskId, data) =>
  axiosInstance.put(`/task/${taskId}/reschedule`, data)