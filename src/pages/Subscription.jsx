import { useCallback, useEffect, useState } from "react";

import {
  Search,
  Pencil,
  CalendarDays,
  ShieldCheck,
  CircleCheck,
  CircleAlert,
  CreditCard,
  Receipt,
  Download,
} from "lucide-react";

import {
  getMySubscription,
  createCheckout,
  submitToPayU,
} from "../services/subscriptionService";

import "./HelpSubscription.css";

// Default prices (backend se aaye to wahi dikhengi)
const DEFAULT_PRICES = { monthly: 49, yearly: 199 };

const plans = [
  {
    key: "basic",
    title: "Basic Plan (Free)",
    icon: Pencil,
    tone: "mint",
    features: [
      "Access to Core Materials",
      "Standard Assignments",
      "Basic Discussions",
    ],
    button: "Start Free Trial",
  },
  {
    key: "monthly",
    title: "Monthly Plan",
    icon: CalendarDays,
    tone: "lavender",
    features: [
      "All Basic Plan Features",
      "Full Course Access",
      "Priority Discussions",
      "Advanced Assignments",
    ],
    small: "per month",
    button: "Choose Monthly Plan",
  },
  {
    key: "yearly",
    title: "Yearly Plan",
    icon: ShieldCheck,
    tone: "sky",
    features: [
      "All Monthly Plan Features",
      "Year-long Access",
      "Discounted Price",
      "Creator Community Access",
      "Advanced Authoring Tools",
    ],
    small: "per year",
    button: "Save with Yearly Plan",
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// 15-Oct-2026
function formatShort(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return `${String(d.getDate()).padStart(2, "0")}-${
    MONTHS[d.getMonth()]
  }-${d.getFullYear()}`;
}

// Nov 15, 2026
function formatLong(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatAmount(value) {
  const n = Number(value) || 0;

  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const errorStyle = {
  background: "#fef2f2",
  borderColor: "#fecaca",
  color: "#b91c1c",
};

function Subscription({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingKey, setPayingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSubscription = useCallback(async () => {
    try {
      const data = await getMySubscription();
      setSub(data);
    } catch (err) {
      setError(err.message || "Could not load your subscription.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // PayU se wapas aane par URL me ?payment=success|failed|error&txn=... hota hai
    const params = new URLSearchParams(window.location.search);
    const result = params.get("payment");

    if (result) {
      if (result === "success") {
        setMessage("Payment successful! Your plan is now active.");
        window.dispatchEvent(new Event("subscription-updated"));
      } else if (result === "failed") {
        setError("Payment failed or was cancelled. Please try again.");
      } else {
        setError(
          "We could not confirm your payment. If money was deducted, it will be confirmed automatically in a few minutes."
        );
      }

      // URL saaf karo taaki refresh par message dobara na aaye
      window.history.replaceState({}, "", window.location.pathname);
    }

    loadSubscription();
  }, [loadSubscription]);

  // PayU page se browser Back dabane par button atka na rahe
  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) setPayingKey("");
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // ---- Backend se aayi prices ----
  const prices = { ...DEFAULT_PRICES };

  (sub?.plans || []).forEach((p) => {
    prices[p.key] = p.amount;
  });

  const status = sub?.status || "";

  // Kaun sa plan abhi chal raha hai
  let currentKey = "";

  if (status === "Active") currentKey = sub.planKey;
  else if (status === "Trial") currentKey = "basic";

  const text = query.trim().toLowerCase();

  const visiblePlans = plans.filter(
    (plan) =>
      !text ||
      plan.title.toLowerCase().includes(text) ||
      plan.features.some((f) => f.toLowerCase().includes(text))
  );

  function priceFor(plan) {
    if (plan.key === "basic") {
      return {
        big:
          status === "Trial" && sub?.daysLeft > 0
            ? `${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left`
            : "2 days free trial",
        small: `Thereafter ₹${formatAmount(prices.monthly)}/month`,
      };
    }

    return {
      big: `₹${formatAmount(prices[plan.key])}`,
      small: plan.small,
    };
  }

  function buttonLabel(plan, isCurrent) {
    if (payingKey === plan.key) return "Redirecting to PayU...";
    if (isCurrent) return "Current Plan";

    if (plan.key === "basic") {
      return status === "Trial" ? "Current Plan" : "Trial Used";
    }

    // Active plan ke baad usi plan ko dobara kharid sakte ho (validity badh jaati hai)
    if (status === "Active" && sub?.planKey === plan.key) {
      return "Renew Plan";
    }

    return plan.button;
  }

  // ---- PayU payment ----
  async function handleChoose(plan) {
    setMessage("");
    setError("");

    // Basic plan free hai, trial signup par apne aap shuru ho jaata hai
    if (plan.key === "basic") {
      setMessage(
        status === "Trial"
          ? "Your free trial is already active."
          : "Your free trial has ended. Please choose a paid plan."
      );
      return;
    }

    if (payingKey) return;

    setPayingKey(plan.key);

    try {
      // Backend amount aur hash banata hai
      const checkout = await createCheckout(plan.key);

      // PayU ke secure payment page par bhejo
      submitToPayU(checkout);
    } catch (err) {
      setError(err.message || "Could not start the payment.");
      setPayingKey("");
    }
  }

  function handleDownload(payment) {
    const content = [
      "Examo - Payment Receipt",
      "-----------------------",
      `Receipt No : PAY-${payment.id}`,
      `Date       : ${formatShort(payment.paidAt)}`,
      `Plan       : ${payment.planKey}`,
      `Amount     : ${payment.currency || "INR"} ${formatAmount(
        payment.amount
      )}`,
      `Payment ID : ${payment.paymentId || "-"}`,
      `Txn ID     : ${payment.txnId || "-"}`,
      "Status     : Paid",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `PAY-${payment.id}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleManagePayments() {
    setError("");
    setMessage(
      "Payments are processed securely by PayU. You can pay with card, UPI or net banking when you choose a plan."
    );
  }

  const payments = sub?.payments || [];

  // Right panel ki date line
  let dateLabel = "Next Billing Date:";
  let dateValue = "-";

  if (status === "Active") {
    dateLabel = "Valid Till:";
    dateValue = formatLong(sub.endsAt);
  } else if (status === "Trial") {
    dateLabel = "Trial Ends:";
    dateValue = formatLong(sub.trialEndsAt);
  } else if (status === "Expired") {
    dateLabel = "Trial Ended:";
    dateValue = formatLong(sub.trialEndsAt);
  }

  const statusText = loading ? "Loading..." : status || "-";
  const statusIsGood = status === "Active" || status === "Trial" || status === "Admin";

  return (
    <div className="hs-page">
      <div className="hs-main">
        <section className="hs-hero">
          <div className="hs-hero-title">
            <h1>Explore Our Flexible Education Plans</h1>
          </div>

          <div className="hs-search">
            <input
              type="text"
              placeholder="Search plans, features, and help..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="button" aria-label="Search">
              <Search size={18} />
            </button>
          </div>
        </section>

        <h2 className="hs-heading">Featured Plans</h2>

        {message && (
          <div className="hs-success hs-success-top">
            <CircleCheck size={16} />
            {message}
          </div>
        )}

        {error && (
          <div className="hs-success hs-success-top" style={errorStyle}>
            <CircleAlert size={16} />
            {error}
          </div>
        )}

        {visiblePlans.length === 0 && (
          <div className="hs-empty">No plans match your search.</div>
        )}

        <div className="hs-card-grid">
          {visiblePlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentKey === plan.key;
            const price = priceFor(plan);

            // Basic: hamesha disabled (trial apne aap chalta hai)
            const disabled =
              isCurrent ||
              plan.key === "basic" ||
              Boolean(payingKey) ||
              loading;

            return (
              <div
                className={`hs-plan-card ${isCurrent ? "current" : ""}`}
                key={plan.key}
              >
                <div className={`hs-faq-card-head ${plan.tone}`}>
                  <h3>{plan.title}</h3>
                  <Icon size={34} strokeWidth={1.6} />
                </div>

                <div className="hs-plan-body">
                  <strong className="hs-plan-label">Features:</strong>

                  <ul className="hs-plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <div className="hs-plan-price">{price.big}</div>
                  <div className="hs-plan-sub">{price.small}</div>

                  <button
                    type="button"
                    className="hs-btn"
                    disabled={disabled}
                    onClick={() => handleChoose(plan)}
                  >
                    {buttonLabel(plan, isCurrent)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="hs-side">
        <h2>Your Subscription Details</h2>

        <div className="hs-panel">
          <div className="hs-panel-row">
            <h3>Current Status</h3>
            <span className="hs-status-icon">
              <CircleCheck size={22} />
            </span>
          </div>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className="hs-active"
              style={statusIsGood ? undefined : { color: "#b91c1c" }}
            >
              {statusText}
            </span>
          </p>

          {status === "Active" && sub?.planName && (
            <p>
              <strong>Plan:</strong> {sub.planName}
            </p>
          )}

          <hr />

          <p>
            <strong>{dateLabel}</strong> {dateValue}
          </p>

          <button
            type="button"
            className="hs-btn"
            onClick={handleManagePayments}
          >
            <CreditCard size={16} />
            Manage Payment Methods
          </button>

          <hr />

          <div className="hs-panel-row">
            <h3>Previous Payments</h3>
            <Receipt size={26} className="hs-muted-icon" />
          </div>

          {payments.length === 0 ? (
            <p className="hs-panel-text">No payments yet.</p>
          ) : (
            <ul className="hs-payments">
              {payments.map((payment) => (
                <li key={payment.id}>
                  <span>
                    {formatShort(payment.paidAt)}: INR{" "}
                    {formatAmount(payment.amount)}
                  </span>

                  <button
                    type="button"
                    className="hs-btn hs-btn-sm"
                    onClick={() => handleDownload(payment)}
                  >
                    <Download size={14} />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hs-panel">
          <h3>Need anything else?</h3>

          <p className="hs-panel-text">
            Check our FAQ for plan changes or billing.
          </p>

          <button
            type="button"
            className="hs-link-btn"
            onClick={() => onNavigate?.("help")}
          >
            Go to Help Section
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Subscription;
