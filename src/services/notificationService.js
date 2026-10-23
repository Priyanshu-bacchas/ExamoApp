import { apiGet, apiPut, apiDelete } from "./api";

// Layout (bell + sidebar badge) ko bataane ke liye: notifications badli hain
export const NOTIFICATIONS_CHANGED = "examo-notifications-changed";

export function notifyNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}

// { unreadCount, items: [{ id, type, title, message, examName, isRead, createdAt }] }
export const getNotifications = ({ unreadOnly = false, take = 100 } = {}) =>
  apiGet(`/Notifications?unreadOnly=${unreadOnly}&take=${take}`);

// { unreadCount }
export const getUnreadCount = () => apiGet("/Notifications/unread-count");

export const markNotificationRead = (id) =>
  apiPut(`/Notifications/${id}/read`, {});

export const markAllNotificationsRead = () =>
  apiPut("/Notifications/read-all", {});

export const deleteNotification = (id) =>
  apiDelete(`/Notifications/${id}`);

export const clearAllNotifications = () => apiDelete("/Notifications");
