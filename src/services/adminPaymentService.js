import { apiGet, apiPost, apiPut } from "./api";

// =====================================================
// Admin > Payments
//
// Backend: AdminPaymentsController (sirf Admin)
//   GET  /Admin/payments/subscriptions?status=&plan=&search=
//        -> { items: [...], stats: {...} }
//   PUT  /Admin/payments/subscriptions/{userId}        { planKey, startsAt, endsAt, note }
//   POST /Admin/payments/subscriptions/{userId}/renew  { planKey, days, note }
//   GET  /Admin/payments/plans                         -> [{ key, name, amount, days }]
//   PUT  /Admin/payments/plans/{key}                   { amount }   (rupees)
//
// startsAt / endsAt "yyyy-MM-dd" ke form me bheji jaati hain.
// =====================================================

export const getAdminSubscriptions = ({
  status = "",
  plan = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (plan) params.set("plan", plan);
  if (search) params.set("search", search);

  const query = params.toString();

  return apiGet(`/Admin/payments/subscriptions${query ? `?${query}` : ""}`);
};

export const getAdminPlans = () => apiGet("/Admin/payments/plans");

export const updateAdminPlanPrice = (key, amount) =>
  apiPut(`/Admin/payments/plans/${key}`, { amount });

// data = { planKey, startsAt, endsAt, note }
export const updateUserSubscription = (userId, data) =>
  apiPut(`/Admin/payments/subscriptions/${userId}`, data);

// data = { planKey, days, note }
export const renewUserSubscription = (userId, data) =>
  apiPost(`/Admin/payments/subscriptions/${userId}/renew`, data);
