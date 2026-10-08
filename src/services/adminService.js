import { apiGet } from "./api";

// System Monitoring: totals + recent activity
export const getAdminOverview = (fresh = false) =>
  apiGet(`/Admin/overview${fresh ? "?fresh=true" : ""}`);

// Logs & Security
export const getActivityLogs = ({
  action = "",
  search = "",
  take = 200,
} = {}) => {
  const params = new URLSearchParams();

  if (action) params.set("action", action);
  if (search) params.set("search", search);
  params.set("take", String(take));

  return apiGet(`/Admin/logs?${params.toString()}`);
};
