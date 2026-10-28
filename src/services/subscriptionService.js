import { apiGet, apiPost } from "./api";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

// GET /api/Subscription/me -> status + plans + previous payments
export const getMySubscription = () => apiGet("/Subscription/me");

// POST /api/Subscription/order -> Razorpay order (amount backend decide karta hai)
export const createOrder = (plan) =>
  apiPost("/Subscription/order", { plan });

// POST /api/Subscription/verify -> payment signature verify + plan activate
export const verifyPayment = ({ orderId, paymentId, signature }) =>
  apiPost("/Subscription/verify", { orderId, paymentId, signature });

// Razorpay checkout.js ek hi baar load hoti hai
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}