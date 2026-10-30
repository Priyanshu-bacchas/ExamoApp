import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Users,
  CircleCheck,
  Clock,
  CircleAlert,
  Pencil,
} from "lucide-react";

import Modal from "../components/Modal";

import {
  getAdminSubscriptions,
  getAdminPlans,
  updateAdminPlanPrice,
  getAdminTrial,
  updateAdminTrial,
  updateUserSubscription,
  renewUserSubscription,
} from "../services/adminPaymentService";

import "./AdminPayments.css";

const PAGE_SIZE = 15;

const EMPTY_STATS = {
  total: 0,
  active: 0,
  trial: 0,
  expired: 0,
  revenue: 0,
};

const STATUS_PILL = {
  Active: "adm-pill-green",
  Trial: "adm-pill-blue",
  Expired: "adm-pill-red",
};

function AdminPayments() {
  const [tab, setTab] = useState("subscriptions");

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [plans, setPlans] = useState([]);
  const [priceDrafts, setPriceDrafts] = useState({});

  // Free trial ke din (admin yahin se badalta hai)
  const [trialDays, setTrialDays] = useState(2);
  const [trialDraft, setTrialDraft] = useState("2");
  const [savingTrial, setSavingTrial] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Edit / Renew popup
  const [modal, setModal] = useState(null); // { type: "edit" | "renew", item }
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Price save
  const [savingPlan, setSavingPlan] = useState("");

  const planByKey = useMemo(() => {
    const map = {};

    plans.forEach((p) => {
      map[p.key] = p;
    });

    return map;
  }, [plans]);

  // Success notice kuch seconds baad hat jaye
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 5000);

    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, planFilter]);

  async function loadAll(searchValue = search) {
    try {
      setLoading(true);
      setError("");

      const [subs, planList, trial] = await Promise.all([
        getAdminSubscriptions({
          status,
          plan: planFilter,
          search: searchValue.trim(),
        }),
        getAdminPlans(),
        getAdminTrial().catch(() => null),
      ]);

      if (trial && Number.isFinite(Number(trial.days))) {
        setTrialDays(Number(trial.days));
        setTrialDraft(String(trial.days));
      }

      const list = Array.isArray(planList) ? planList : [];

      setItems(Array.isArray(subs?.items) ? subs.items : []);
      setStats({ ...EMPTY_STATS, ...(subs?.stats || {}) });
      setPlans(list);

      const drafts = {};

      list.forEach((p) => {
        drafts[p.key] = String(p.amount);
      });

      setPriceDrafts(drafts);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadAll();
  }

  // ---------------- Edit / Renew ----------------

  function openEdit(item) {
    const planKey = item.planKey || plans[0]?.key || "monthly";
    const days = planByKey[planKey]?.days || 30;

    setForm({
      planKey,
      startsAt: toInputDate(item.startsAt) || toInputDate(new Date()),
      endsAt:
        toInputDate(item.endsAt) ||
        toInputDate(addDays(new Date(), days)),
      note: "",
    });

    setFormError("");
    setModal({ type: "edit", item });
  }

  function openRenew(item) {
    const planKey = item.planKey || plans[0]?.key || "monthly";

    setForm({
      planKey,
      days: String(planByKey[planKey]?.days || 30),
      note: "",
    });

    setFormError("");
    setModal({ type: "renew", item });
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setFormError("");
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function changeRenewPlan(planKey) {
    setForm((prev) => ({
      ...prev,
      planKey,
      days: String(planByKey[planKey]?.days || prev.days),
    }));
  }

  async function submitEdit(event) {
    event.preventDefault();

    if (!form.planKey) {
      setFormError("Please choose a plan.");
      return;
    }

    if (!form.startsAt || !form.endsAt) {
      setFormError("Please select both the start and end dates.");
      return;
    }

    if (form.endsAt < form.startsAt) {
      setFormError("The end date cannot be before the start date.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await updateUserSubscription(modal.item.userId, {
        planKey: form.planKey,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        note: form.note.trim(),
      });

      setNotice(`Subscription updated for ${modal.item.name}.`);
      setModal(null);

      await loadAll();
    } catch (err) {
      setFormError(err.message || "Unable to update the subscription.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRenew(event) {
    event.preventDefault();

    const days = Number(form.days);

    if (!form.planKey) {
      setFormError("Please choose a plan.");
      return;
    }

    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      setFormError("Days must be a whole number between 1 and 3650.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await renewUserSubscription(modal.item.userId, {
        planKey: form.planKey,
        days,
        note: form.note.trim(),
      });

      setNotice(
        `${modal.item.name}'s plan renewed for ${days} day${
          days === 1 ? "" : "s"
        }.`
      );
      setModal(null);

      await loadAll();
    } catch (err) {
      setFormError(err.message || "Unable to renew the subscription.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------- Plan pricing ----------------

  async function savePrice(plan) {
    const amount = Number(priceDrafts[plan.key]);

    if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
      setError("Price must be between ₹1 and ₹1,00,000.");
      return;
    }

    try {
      setSavingPlan(plan.key);
      setError("");

      await updateAdminPlanPrice(plan.key, amount);

      setNotice(
        `${plan.name} price updated to ₹${formatAmount(
          amount
        )}. It applies to new payments only.`
      );

      await loadAll();
    } catch (err) {
      setError(err.message || "Unable to update the price.");
    } finally {
      setSavingPlan("");
    }
  }

  async function saveTrial() {
    const days = Number(trialDraft);

    if (!Number.isInteger(days) || days < 0 || days > 90) {
      setError("Trial must be a whole number between 0 and 90 days.");
      return;
    }

    try {
      setSavingTrial(true);
      setError("");

      await updateAdminTrial(days);

      setNotice(
        days === 0
          ? "Free trial turned off for new users."
          : `Free trial set to ${days} day${days === 1 ? "" : "s"}. It applies to users whose trial has not started yet.`
      );

      await loadAll();
    } catch (err) {
      setError(err.message || "Unable to update the free trial.");
    } finally {
      setSavingTrial(false);
    }
  }

  // ---------------- Table paging ----------------

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Renew popup: naya end date kya hoga
  const renewPreview = useMemo(() => {
    if (modal?.type !== "renew") return "";

    const days = Number(form.days);

    if (!Number.isInteger(days) || days < 1) return "";

    const end = modal.item.endsAt ? new Date(modal.item.endsAt) : null;

    const stillRunning =
      modal.item.status === "Active" && end && end.getTime() > Date.now();

    const base = stillRunning ? end : new Date();

    return formatDate(addDays(base, days));
  }, [modal, form.days]);

  return (
    <div>
      <div className="adm-heading">
        <div>
          <h1>Payments</h1>
          <p>
            Subscription status of every user, and the price of each plan.
          </p>
        </div>

        <button
          type="button"
          className="adm-btn"
          onClick={() => loadAll()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "adm-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <div className="adm-alert">{error}</div>}

      {notice && <div className="adm-notice">{notice}</div>}

      <div className="apay-tabs">
        <button
          type="button"
          className={`apay-tab ${tab === "subscriptions" ? "active" : ""}`}
          onClick={() => setTab("subscriptions")}
        >
          Subscriptions
        </button>

        <button
          type="button"
          className={`apay-tab ${tab === "pricing" ? "active" : ""}`}
          onClick={() => setTab("pricing")}
        >
          Plan Pricing
        </button>
      </div>

      {tab === "subscriptions" && (
        <>
          <div className="adm-stats apay-stats">
            <StatCard
              tone="blue"
              icon={<Users size={20} />}
              title="Total Users"
              value={stats.total}
              text="Students"
            />

            <StatCard
              tone="green"
              icon={<CircleCheck size={20} />}
              title="Active Plans"
              value={stats.active}
              text={`₹${formatAmount(stats.revenue)} collected`}
            />

            <StatCard
              tone="amber"
              icon={<Clock size={20} />}
              title="Free Trial"
              value={stats.trial}
              text="Trial running"
            />

            <StatCard
              tone="red"
              icon={<CircleAlert size={20} />}
              title="Expired"
              value={stats.expired}
              text="Need a plan"
            />
          </div>

          <form className="adm-filters" onSubmit={handleSearchSubmit}>
            <div className="adm-field grow">
              <label>Search</label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email or mobile number..."
              />
            </div>

            <div className="adm-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Trial">Free Trial</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="adm-field">
              <label>Plan</label>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="">All</option>

                {plans.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="primary-button">
              Search
            </button>

            <span className="adm-count">
              {items.length} user{items.length === 1 ? "" : "s"}
            </span>
          </form>

          <div className="data-card">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <h3>No users found</h3>

                <p>Try a different search or filter.</p>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Ends</th>
                        <th>Time left</th>
                        <th>Paid</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pageItems.map((item) => (
                        <tr key={item.userId}>
                          <td className="apay-user">
                            <strong>{item.name}</strong>

                            <div className="adm-sub">{item.email}</div>
                          </td>

                          <td>{item.planName || "-"}</td>

                          <td>
                            <span
                              className={`adm-pill ${
                                STATUS_PILL[item.status] || "adm-pill-slate"
                              }`}
                            >
                              {item.status === "Trial"
                                ? "Free Trial"
                                : item.status}
                            </span>
                          </td>

                          <td>{formatDate(item.startsAt)}</td>

                          <td>{formatDate(item.endsAt)}</td>

                          <td>{renderTimeLeft(item)}</td>

                          <td>
                            {item.totalPaid
                              ? `₹${formatAmount(item.totalPaid)}`
                              : "-"}
                          </td>

                          <td>
                            <div className="apay-actions">
                              <button
                                type="button"
                                className="adm-btn"
                                onClick={() => openEdit(item)}
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="adm-btn"
                                onClick={() => openRenew(item)}
                              >
                                <RefreshCw size={14} />
                                Renew
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="apay-pager">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      className="adm-btn"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      className="adm-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {tab === "pricing" && (
        <>
          {loading ? (
            <div className="data-card">
              <div className="loading-state">Loading...</div>
            </div>
          ) : (
            <div className="apay-plans">
              {plans.map((plan) => {
                const draft = priceDrafts[plan.key] ?? "";
                const changed = Number(draft) !== Number(plan.amount);
                const busy = savingPlan === plan.key;

                return (
                  <div className="apay-plan" key={plan.key}>
                    <div className="apay-plan-head">
                      <h3>{plan.name}</h3>

                      <span className="adm-pill adm-pill-blue">
                        {plan.days} days
                      </span>
                    </div>

                    <div className="apay-plan-meta">
                      Current price:{" "}
                      <strong>₹{formatAmount(plan.amount)}</strong>
                    </div>

                    <div className="adm-field" style={{ minWidth: 0 }}>
                      <label htmlFor={`price-${plan.key}`}>
                        New price (₹)
                      </label>

                      <div className="apay-price-box">
                        <span>₹</span>

                        <input
                          id={`price-${plan.key}`}
                          type="number"
                          min="1"
                          max="100000"
                          step="1"
                          value={draft}
                          disabled={busy}
                          onChange={(e) =>
                            setPriceDrafts((prev) => ({
                              ...prev,
                              [plan.key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      disabled={!changed || busy}
                      onClick={() => savePrice(plan)}
                    >
                      <CircleCheck size={15} />
                      {busy ? "Saving..." : "Save price"}
                    </button>
                  </div>
                );
              })}

              {/* Free trial */}
              <div className="apay-plan">
                <div className="apay-plan-head">
                  <h3>Free Trial</h3>

                  <span className="adm-pill adm-pill-green">Trial</span>
                </div>

                <div className="apay-plan-meta">
                  Current length:{" "}
                  <strong>
                    {trialDays === 0
                      ? "Off"
                      : `${trialDays} day${trialDays === 1 ? "" : "s"}`}
                  </strong>
                </div>

                <div className="adm-field" style={{ minWidth: 0 }}>
                  <label htmlFor="trial-days">New length (days)</label>

                  <div className="apay-price-box">
                    <span>#</span>

                    <input
                      id="trial-days"
                      type="number"
                      min="0"
                      max="90"
                      step="1"
                      value={trialDraft}
                      disabled={savingTrial}
                      onChange={(e) => setTrialDraft(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  disabled={
                    savingTrial || Number(trialDraft) === Number(trialDays)
                  }
                  onClick={saveTrial}
                >
                  <CircleCheck size={15} />
                  {savingTrial ? "Saving..." : "Save trial"}
                </button>
              </div>
            </div>
          )}

          <p className="apay-note">
            The new price is used for payments made after you save it. Plans
            that users have already paid for are not changed. The minimum
            price is ₹1. The trial length applies to users whose trial has not
            started yet (users already in a trial keep their dates). Set it to
            0 to turn the free trial off.
          </p>
        </>
      )}

      {modal && (
        <Modal
          title={
            modal.type === "edit"
              ? "Edit subscription"
              : "Renew subscription"
          }
          onClose={closeModal}
        >
          <form
            className="crud-form"
            onSubmit={modal.type === "edit" ? submitEdit : submitRenew}
          >
            <div className="apay-modal-user">
              <strong>{modal.item.name}</strong> · {modal.item.email}
              <br />
              Current status:{" "}
              <strong>
                {modal.item.status === "Trial"
                  ? "Free Trial"
                  : modal.item.status}
              </strong>
              {modal.item.endsAt && (
                <>
                  {" "}
                  · Ends on <strong>{formatDate(modal.item.endsAt)}</strong>
                </>
              )}
            </div>

            {modal.type === "edit" && modal.item.status !== "Active" && (
              <div className="apay-hint">
                This user does not have an active paid plan. Saving will give
                them a paid plan with the dates below.
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="apay-plan">Plan</label>

              <select
                id="apay-plan"
                value={form.planKey}
                disabled={saving}
                onChange={(e) =>
                  modal.type === "renew"
                    ? changeRenewPlan(e.target.value)
                    : setField("planKey", e.target.value)
                }
              >
                {plans.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} (₹{formatAmount(p.amount)} / {p.days} days)
                  </option>
                ))}
              </select>
            </div>

            {modal.type === "edit" ? (
              <>
                <div className="form-group">
                  <label htmlFor="apay-start">Start date</label>

                  <input
                    id="apay-start"
                    type="date"
                    value={form.startsAt}
                    disabled={saving}
                    onChange={(e) => setField("startsAt", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apay-end">End date</label>

                  <input
                    id="apay-end"
                    type="date"
                    value={form.endsAt}
                    disabled={saving}
                    onChange={(e) => setField("endsAt", e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group full-width">
                  <label htmlFor="apay-days">Days to add</label>

                  <input
                    id="apay-days"
                    type="number"
                    min="1"
                    max="3650"
                    step="1"
                    value={form.days}
                    disabled={saving}
                    onChange={(e) => setField("days", e.target.value)}
                  />
                </div>

                {renewPreview && (
                  <div className="apay-hint">
                    {modal.item.status === "Active"
                      ? "The days are added after the current end date."
                      : "The plan starts today."}{" "}
                    New end date: <strong>{renewPreview}</strong>
                  </div>
                )}
              </>
            )}

            <div className="form-group full-width">
              <label htmlFor="apay-note">Note (optional)</label>

              <input
                id="apay-note"
                type="text"
                maxLength={200}
                placeholder="Reason for this change"
                value={form.note}
                disabled={saving}
                onChange={(e) => setField("note", e.target.value)}
              />
            </div>

            {formError && <div className="apay-form-error">{formError}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={saving}
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : modal.type === "edit"
                  ? "Save changes"
                  : "Renew plan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ tone, icon, title, value, text }) {
  return (
    <div className="adm-stat">
      <div className={`adm-stat-icon adm-tone-${tone}`}>{icon}</div>

      <div className="adm-stat-body">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{text}</small>
      </div>
    </div>
  );
}

function renderTimeLeft(item) {
  if (item.status === "Expired") {
    return <span className="apay-days muted">Expired</span>;
  }

  if (item.status !== "Active" && item.status !== "Trial") {
    return <span className="apay-days muted">-</span>;
  }

  const days = Number(item.daysLeft) || 0;

  return (
    <span className={`apay-days ${days <= 7 ? "soon" : ""}`}>
      {days} day{days === 1 ? "" : "s"}
    </span>
  );
}

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
}

// 15 Oct 2026
function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// <input type="date"> ke liye yyyy-mm-dd (local date)
function toInputDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatAmount(value) {
  const n = Number(value) || 0;

  return Number.isInteger(n)
    ? n.toLocaleString("en-IN")
    : n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}

export default AdminPayments;
