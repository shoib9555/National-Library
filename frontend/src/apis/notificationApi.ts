import apiClient from "../apis/client";

export interface Notification {
  id: number;
  type: string;
  channel: string;
  status: string;
  title: string;
  message: string;
  createdAt: string;
  sentAt?: string | null;
}

interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}

export async function getMyNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<NotificationsResponse>(
    "/notifications/me"
  );

  return response.data.notifications;
}