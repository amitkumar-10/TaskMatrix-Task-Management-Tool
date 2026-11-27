import axiosInstance from './axiosInstance'

export const getNotifications = () =>
  axiosInstance.get('/notification/all')

export const getUnreadNotifications = () =>
  axiosInstance.get('/notification/unread')

export const getUnreadCount = () =>
  axiosInstance.get('/notification/count')

export const markAsRead = (notificationId) =>
  axiosInstance.put(`/notification/${notificationId}/read`)

export const markAllAsRead = () =>
  axiosInstance.put('/notification/read-all')