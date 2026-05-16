import { apiRequest } from './client';

export function fetchNotifications() {
  return apiRequest('/api/notifications');
}

export function markNotificationRead(id) {
  return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return apiRequest('/api/notifications/read-all', { method: 'PATCH' });
}
