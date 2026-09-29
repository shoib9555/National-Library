import apiClient from "./client"

export interface LibrarianNotification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

interface NotificationsResponse {
  message: string
  notifications: LibrarianNotification[]
}

export async function getLibrarianNotifications(): Promise<
  LibrarianNotification[]
> {
  const response = await apiClient.get<NotificationsResponse>(
    "/librarian-notifications"
  )

  return response.data.notifications
}

export async function getUnreadLibrarianNotifications(): Promise<
  LibrarianNotification[]
> {
  const response = await apiClient.get<NotificationsResponse>(
    "/librarian-notifications/unread"
  )

  return response.data.notifications
}

export async function markLibrarianNotificationAsRead(
  notificationId: number
) {
  const response = await apiClient.patch(
    `/librarian-notifications/${notificationId}/read`
  )

  return response.data
}

export async function markAllLibrarianNotificationsAsRead() {
  const response = await apiClient.patch(
    "/librarian-notifications/read-all"
  )

  return response.data
}