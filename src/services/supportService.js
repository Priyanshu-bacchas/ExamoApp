import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// ---------- Student: Help > Contact Us ----------
// data = { name, email, subject, message }
export const sendContactMessage = (data) =>
  apiPost("/Help/contact", data);

// ---------- Admin: Help & Support ----------
export const getSupportMessages = ({ status = "", search = "" } = {}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const query = params.toString();

  return apiGet(`/Help/messages${query ? `?${query}` : ""}`);
};

export const updateSupportMessageStatus = (id, status) =>
  apiPut(`/Help/messages/${id}/status`, { status });

export const deleteSupportMessage = (id) =>
  apiDelete(`/Help/messages/${id}`);

// Admin reply -> student ko email (Resend) se jaata hai
// data = { reply, markResolved }
export const replyToSupportMessage = (id, data) =>
  apiPost(`/Help/messages/${id}/reply`, data);