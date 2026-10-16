import { useState } from "react";

import {
  Search,
  Pencil,
  CalendarDays,
  ShieldCheck,
  CircleCheck,
  CreditCard,
  Receipt,
  Download,
} from "lucide-react";

import "./HelpSubscription.css";

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
    big: "2 days free trial",
    small: "Thereafter ₹49/month",
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
    big: "₹49",
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
    big: "₹199",
    small: "per year",
    button: "Save with Yearly Plan",
  },
];

// Demo data (sirf frontend)
const payments = [
  { id: "PAY-1004", date: "15-Oct-2026", amount: 49 },
  { id: "PAY-1003", date: "15-Sep-2026", amount: 49 },
  { id: "PAY-1002", date: "15-Aug-2026", amount: 49 },
  { id: "PAY-1001", date: "15-Jul-2026", amount: 49 },
];

function Subscription({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [currentPlan, setCurrentPlan] = useState("monthly");
  const [message, setMessage] = useState("");

  const text = query.trim().toLowerCase();

  const visiblePlans = plans.filter(
    (plan) =>
      !text ||
      plan.title.toLowerCase().includes(text) ||
      plan.features.some((f) => f.toLowerCase().includes(text))
  );

  function handleChoose(plan) {
    setCurrentPlan(plan.key);
    setMessage(`${plan.title} selected.`);
  }

  function handleDownload(payment) {
    const content = [
      "Examo - Payment Receipt",
      "-----------------------",
      `Receipt No : ${payment.id}`,
      `Date       : ${payment.date}`,
      `Amount     : INR ${payment.amount}`,
      "Status     : Paid",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${payment.id}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

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

        {visiblePlans.length === 0 && (
          <div className="hs-empty">
            No plans match your search.
          </div>
        )}

        <div className="hs-card-grid">
          {visiblePlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.key;

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

                  <div className="hs-plan-price">{plan.big}</div>
                  <div className="hs-plan-sub">{plan.small}</div>

                  <button
                    type="button"
                    className="hs-btn"
                    disabled={isCurrent}
                    onClick={() => handleChoose(plan)}
                  >
                    {isCurrent ? "Current Plan" : plan.button}
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
            <span className="hs-active">Active</span>
          </p>

          <hr />

          <p>
            <strong>Next Billing Date:</strong> Nov 15, 2026
          </p>

          <button type="button" className="hs-btn">
            <CreditCard size={16} />
            Manage Payment Methods
          </button>

          <hr />

          <div className="hs-panel-row">
            <h3>Previous Payments</h3>
            <Receipt size={26} className="hs-muted-icon" />
          </div>

          <ul className="hs-payments">
            {payments.map((payment) => (
              <li key={payment.id}>
                <span>
                  {payment.date}: INR {payment.amount}
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
