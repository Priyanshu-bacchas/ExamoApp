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

import { getUser, getDisplayName } from "../services/authService";

import "./HelpSubscription.css";

// ===== Payment slip: colourful PNG image (browser me hi banti hai) =====

const SLIP_W = 1000;
const SLIP_SCALE = 2; // retina jaisi saaf image

const SLIP_SANS =
  'Arial,"Segoe UI",Roboto,"Helvetica Neue",sans-serif';

const SLIP_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// 28 Oct 2026
function formatSlipDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getDate()} ${SLIP_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Start aur end date ke beech kitne din
function daysBetween(start, end) {
  if (!start || !end) return 0;

  const a = new Date(start).getTime();
  const b = new Date(end).getTime();

  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;

  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function slip_font(size, bold) {
  return `${bold ? "700" : "400"} ${size}px ${SLIP_SANS}`;
}

// Lamba text ho to ... laga do
function slip_clip(ctx, text, maxWidth, size, bold) {
  ctx.font = slip_font(size, bold);

  let value = String(text);

  if (ctx.measureText(value).width <= maxWidth) return value;

  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }

  return `${value}…`;
}

function slip_text(ctx, text, x, y, size, color, bold, align) {
  ctx.font = slip_font(size, bold);
  ctx.fillStyle = color;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

// Ek line me normal + bold text ek ke baad ek
function slip_runs(ctx, runs, x, y, size, color) {
  let cursor = x;

  runs.forEach((run) => {
    ctx.font = slip_font(size, run.bold);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(run.text, cursor, y);

    cursor += ctx.measureText(run.text).width;
  });
}

function slip_roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Rangeen box: left border + chhota badge (PAID / VALID / NOTE)
function slip_callout(ctx, y, h, theme, badge, drawBody) {
  const x = 50;
  const w = 900;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = theme.border;
  ctx.fillRect(x, y, 7, h);

  const badgeW = badge.length * 15 + 34;

  ctx.fillStyle = theme.badge;
  slip_roundRect(ctx, x + 28, y + 22, badgeW, 34, 6);
  ctx.fill();

  slip_text(ctx, badge, x + 28 + badgeW / 2, y + 46, 19, "#ffffff", true, "center");

  drawBody(x + 28, x + 28 + badgeW + 16, y);
}

/*
  data = {
    receiptNo, amountText, currency, paidOn,
    planName, studentName,
    startsOn, endsOn, validityText,
    paymentId, txnId
  }
  Return: PNG Blob
*/
function createPaymentSlip(data) {
  const symbol =
    !data.currency || data.currency === "INR" ? "₹" : `${data.currency} `;

  const amount = `${symbol}${data.amountText}`;

  const rows = [
    ["Receipt No", data.receiptNo],
    ["Paid On", data.paidOn],
    ["Paid By", data.studentName],
    ["Plan", data.planName],
    ["Amount", amount],
    ["Plan Starts", data.startsOn],
    ["Plan Ends", data.endsOn],
    ["Valid For", data.validityText || "-"],
    ["Payment ID", data.paymentId],
    ["Transaction ID", data.txnId],
    ["Status", "Paid"],
  ];

  const ROW_H = 54;
  const TABLE_Y = 704;
  const height = TABLE_Y + 58 + rows.length * ROW_H + 120;

  const canvas = document.createElement("canvas");

  canvas.width = SLIP_W * SLIP_SCALE;
  canvas.height = height * SLIP_SCALE;

  const ctx = canvas.getContext("2d");

  ctx.scale(SLIP_SCALE, SLIP_SCALE);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SLIP_W, height);

  ctx.strokeStyle = "#d6dce8";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SLIP_W - 2, height - 2);

  // Top: logo + naam
  ctx.fillStyle = "#2563eb";
  slip_roundRect(ctx, 50, 44, 48, 48, 12);
  ctx.fill();

  slip_text(ctx, "E", 74, 80, 30, "#ffffff", true, "center");
  slip_text(ctx, "Examo", 112, 80, 32, "#1e3a6e", true);
  slip_text(ctx, "PAYMENT SLIP", 950, 78, 20, "#8a94a6", true, "right");

  // Heading + orange line
  slip_text(ctx, `Payment Slip | ${data.receiptNo}`, 50, 168, 44, "#1e3a6e", true);

  ctx.fillStyle = "#d97706";
  ctx.fillRect(50, 186, 900, 4);

  slip_text(
    ctx,
    `Paid on ${data.paidOn} | ${data.planName}`,
    50,
    236,
    27,
    "#9a4a00",
    true
  );

  const name = slip_clip(ctx, data.studentName, 300, 24, true);

  // 1) Peela box: PAID
  slip_callout(
    ctx,
    268,
    122,
    { bg: "#fff3c4", border: "#f5b400", badge: "#d9820a" },
    "PAID",
    (left, afterBadge, y) => {
      slip_runs(
        ctx,
        [
          { text: "Payment of " },
          { text: amount, bold: true },
          { text: " received for the " },
          { text: data.planName, bold: true },
          { text: "." },
        ],
        afterBadge,
        y + 46,
        24,
        "#1f2937"
      );

      slip_runs(
        ctx,
        [
          { text: "Thank you, " },
          { text: name, bold: true },
          { text: "! Paid securely via PayU." },
        ],
        left,
        y + 94,
        24,
        "#1f2937"
      );
    }
  );

  // 2) Hara box: plan ki dates
  slip_callout(
    ctx,
    414,
    122,
    { bg: "#dff3e1", border: "#2e9e4f", badge: "#2e9e4f" },
    "VALID",
    (left, afterBadge, y) => {
      slip_runs(
        ctx,
        [
          { text: "Plan starts " },
          { text: data.startsOn, bold: true },
          { text: " and ends " },
          { text: data.endsOn, bold: true },
          { text: "." },
        ],
        afterBadge,
        y + 46,
        24,
        "#1f2937"
      );

      slip_runs(
        ctx,
        [
          {
            text: data.validityText
              ? `Valid for ${data.validityText}. Enjoy full access to Examo!`
              : "Enjoy full access to Examo!",
          },
        ],
        left,
        y + 94,
        24,
        "#1f2937"
      );
    }
  );

  // 3) Neela box: note
  slip_callout(
    ctx,
    560,
    112,
    { bg: "#e1ecff", border: "#3b82f6", badge: "#2563eb" },
    "NOTE",
    (left, afterBadge, y) => {
      slip_runs(
        ctx,
        [{ text: "Keep this slip for your records." }],
        afterBadge,
        y + 46,
        24,
        "#1f2937"
      );

      slip_runs(
        ctx,
        [{ text: "Payment and transaction IDs are given in the table below." }],
        left,
        y + 82,
        21,
        "#475569"
      );
    }
  );

  // Table: navy header + halki neeli rows
  ctx.fillStyle = "#1e3a6e";
  ctx.fillRect(50, TABLE_Y, 900, 58);

  slip_text(ctx, "Detail", 72, TABLE_Y + 38, 24, "#ffffff", true);
  slip_text(ctx, "Value", 372, TABLE_Y + 38, 24, "#ffffff", true);

  rows.forEach((row, index) => {
    const y = TABLE_Y + 58 + index * ROW_H;

    ctx.fillStyle = index % 2 === 0 ? "#eef2fb" : "#ffffff";
    ctx.fillRect(50, y, 900, ROW_H);

    ctx.strokeStyle = "#c9d3ea";
    ctx.lineWidth = 1;
    ctx.strokeRect(50.5, y + 0.5, 899, ROW_H);

    ctx.beginPath();
    ctx.moveTo(350.5, y);
    ctx.lineTo(350.5, y + ROW_H);
    ctx.stroke();

    slip_text(ctx, row[0], 72, y + 35, 23, "#1f2937", false);

    const isStatus = row[0] === "Status";
    const isAmount = row[0] === "Amount";

    const value = slip_clip(ctx, row[1], 560, 23, isStatus || isAmount);

    slip_text(
      ctx,
      value,
      372,
      y + 35,
      23,
      isStatus ? "#16a34a" : "#111827",
      isStatus || isAmount
    );
  });

  // Footer
  const footerY = TABLE_Y + 58 + rows.length * ROW_H + 52;

  ctx.fillStyle = "#d6dce8";
  ctx.fillRect(50, footerY - 30, 900, 2);

  slip_text(ctx, "Examo | Payment Slip", 50, footerY + 6, 20, "#6b7280", false);
  slip_text(ctx, "Thank you for choosing Examo!", 950, footerY + 6, 20, "#2563eb", true, "right");

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the image."));
    }, "image/png");
  });
}

// ===== Payment slip end =====

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

  // ---- Prices sirf backend se (load hone tak purani / galat price nahi dikhate) ----
  const prices = {};

  (sub?.plans || []).forEach((p) => {
    prices[p.key] = p.amount;
  });

  const pricesReady = Object.keys(prices).length > 0;

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
            : `${sub?.trialDays ?? 2} day${
                (sub?.trialDays ?? 2) === 1 ? "" : "s"
              } free trial`,
        small: pricesReady
          ? `Thereafter ₹${formatAmount(prices.monthly)}/month`
          : "Thereafter ...",
      };
    }

    return {
      big: pricesReady ? `₹${formatAmount(prices[plan.key])}` : "₹ --",
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

  // Payment slip: colourful sticky notes wali PNG image
  async function handleDownload(payment) {
    setMessage("");
    setError("");

    try {
      const plan = (sub?.plans || []).find((p) => p.key === payment.planKey);

      const days = daysBetween(payment.startsAt, payment.endsAt);

      const blob = await createPaymentSlip({
        receiptNo: `PAY-${payment.id}`,
        amountText: formatAmount(payment.amount),
        currency: payment.currency || "INR",
        paidOn: formatSlipDate(payment.paidAt),
        planName: plan?.name || payment.planKey || "-",
        studentName: getDisplayName(getUser()),
        startsOn: formatSlipDate(payment.startsAt),
        endsOn: formatSlipDate(payment.endsAt),
        validityText: days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "",
        paymentId: payment.paymentId || "-",
        txnId: payment.txnId || "-",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `PAY-${payment.id}.png`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not create the payment slip.");
    }
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
