import axiosInstance from './axiosInstance'

export const createTeam = (data) =>
  axiosInstance.post('/team/create', data)

export const getProjectTeams = (projectId) =>
  axiosInstance.get(`/team/project/${projectId}`)

export const getTeam = (teamId) =>
  axiosInstance.get(`/team/${teamId}`)

export const getTeamMembers = (teamId) =>
  axiosInstance.get(`/team/${teamId}/members`)

export const addTeamMember = (data) =>
  axiosInstance.post('/team/members/add', data)

export const removeTeamMember = (teamId, userId) =>
  axiosInstance.delete(`/team/${teamId}/members/${userId}`)

export const leaveTeam = (teamId) =>
  axiosInstance.delete(`/team/${teamId}/leave`)

export const updateTeam = (teamId, data) =>
  axiosInstance.put(`/team/${teamId}`, data)

export const deleteTeam = (teamId) =>
  axiosInstance.delete(`/team/${teamId}`)