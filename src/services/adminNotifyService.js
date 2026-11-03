import { apiGet, apiPut, apiDelete } from "./api";

// =====================================================
// Admin > NotifyMe
//
// Backend: AdminNotificationsController (sirf Admin)
//   GET    /Admin/notifications?type=&unreadOnly=&search=
//          -> { stats: { total, unread, support, subscription }, items: [...] }
//   GET    /Admin/notifications/unread-count     -> { unreadCount }
//   PUT    /Admin/notifications/{id}/read
//   PUT    /Admin/notifications/read-all
//   DELETE /Admin/notifications/{id}
//   DELETE /Admin/notifications/clear-read
//
// type: "support" (Help message) | "subscription" (plan liya)
// =====================================================

export const getAdminNotifications = ({
  type = "",
  unreadOnly = false,
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  if (type) params.set("type", type);
  if (unreadOnly) params.set("unreadOnly", "true");
  if (search) params.set("search", search);

  const query = params.toString();

  return apiGet(`/Admin/notifications${query ? `?${query}` : ""}`);
};

export const getAdminUnreadCount = () =>
  apiGet("/Admin/notifications/unread-count");

export const markAdminNotificationRead = (id) =>
  apiPut(`/Admin/notifications/${id}/read`, {});

export const markAllAdminNotificationsRead = () =>
  apiPut("/Admin/notifications/read-all", {});

export const deleteAdminNotification = (id) =>
  apiDelete(`/Admin/notifications/${id}`);

export const clearReadAdminNotifications = () =>
  apiDelete("/Admin/notifications/clear-read");

// Sidebar badge ko turant refresh karne ke liye
export const NOTIFY_CHANGED_EVENT = "admin-notify-changed";

export const emitNotifyChanged = () =>
  window.dispatchEvent(new Event(NOTIFY_CHANGED_EVENT));
