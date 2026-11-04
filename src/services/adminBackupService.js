import { apiGet, apiPost, apiDelete } from "./api";

// =====================================================
// Admin > Backup (deleted data)
//
// Backend: AdminBackupsController (sirf Admin)
//   GET    /Admin/backups?section=&search=
//          -> { stats: { total, content, notifyme, help }, items: [...] }
//   GET    /Admin/backups/{id}            -> poora saved data (data: {...})
//   POST   /Admin/backups/{id}/restore    -> wapas us section me daalo
//   DELETE /Admin/backups/{id}            -> hamesha ke liye hatao
//
// section: "content" (Content Manager) | "notifyme" | "help" (Help & Support)
// =====================================================

export const getAdminBackups = ({ section = "", search = "" } = {}) => {
  const params = new URLSearchParams();

  if (section) params.set("section", section);
  if (search) params.set("search", search);

  const query = params.toString();

  return apiGet(`/Admin/backups${query ? `?${query}` : ""}`);
};

export const getAdminBackupDetail = (id) =>
  apiGet(`/Admin/backups/${id}`);

export const restoreAdminBackup = (id) =>
  apiPost(`/Admin/backups/${id}/restore`, {});

export const deleteAdminBackup = (id) =>
  apiDelete(`/Admin/backups/${id}`);
