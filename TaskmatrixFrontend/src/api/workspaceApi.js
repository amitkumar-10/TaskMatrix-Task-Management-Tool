import axiosInstance from './axiosInstance'

export const createPersonalTask = (data) =>
  axiosInstance.post('/workspace/task', data)

export const getAllPersonalTasks = () =>
  axiosInstance.get('/workspace/tasks')

export const getPersonalTask = (taskId) =>
  axiosInstance.get(`/workspace/task/${taskId}`)

export const updatePersonalTask = (taskId, data) =>
  axiosInstance.put(`/workspace/task/${taskId}`, data)

export const deletePersonalTask = (taskId) =>
  axiosInstance.delete(`/workspace/task/${taskId}`)

export const getWorkspaceSummary = () =>
  axiosInstance.get('/workspace/summary')