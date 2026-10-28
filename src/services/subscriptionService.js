import { apiGet, apiPost } from "./api";

// GET /api/Subscription/me -> status + plans + previous payments
export const getMySubscription = () => apiGet("/Subscription/me");

// POST /api/Subscription/checkout -> PayU ko bhejne wala data (amount backend tay karta hai)
export const createCheckout = (plan) =>
  apiPost("/Subscription/checkout", { plan });

// PayU Hosted Checkout: hidden form banakar PayU ke page par bhejo.
// Payment ke baad PayU backend ko, aur backend user ko wapas frontend par bhejta hai.
export function submitToPayU(checkout) {
  const form = document.createElement("form");

  form.method = "POST";
  form.action = checkout.actionUrl;
  form.style.display = "none";

  Object.entries(checkout.fields || {}).forEach(([name, value]) => {
    const input = document.createElement("input");

    input.type = "hidden";
    input.name = name;
    input.value = value ?? "";

    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
