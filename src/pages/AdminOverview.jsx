import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  LogIn,
  TriangleAlert,
  UserPlus,
  Activity,
  RefreshCw,
  Trash2,
  Pencil,
  KeyRound,
} from "lucide-react";

import { getAdminOverview } from "../services/adminService";

function AdminOverview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview(fresh = false) {
    try {
      setLoading(true);
      setError("");

      // Ek hi API call: stats + recent activity + signup dates
      const overview = await getAdminOverview(fresh);

      setData(overview);
    } catch (err) {
      console.error(err);
      setError(err.message || "Overview load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }

  // Page turant dikhta hai; data aane tak values "-" rehti hain
  const ready = Boolean(data);

  const stats = data || {};
  const recent = (stats.recentActivity || []).slice(0, 4);

  const registrations = buildRegistrations(
    stats.signupDates || []
  );

  const show = (value) => (ready ? value : "-");

  const logins = stats.loginsLast24Hours ?? 0;
  const failed = stats.failedLoginsLast24Hours ?? 0;
  const totalUsers = stats.totalUsers ?? 0;

  return (
    <div className="adm-dash">
      <div className="adm-heading">
        <div>
          <h1>System Overview</h1>
        </div>

        <button
          type="button"
          className="adm-btn"
          onClick={() => loadOverview(true)}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "adm-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-stats adm-stats-6">
        <StatCard
          tone="blue"
          icon={<Users size={20} />}
          title="Total Students"
          value={show(stats.totalStudents ?? 0)}
          text={`${totalUsers} total users`}
        />

        <StatCard
          tone="violet"
          icon={<ShieldCheck size={20} />}
          title="Admins"
          value={show(stats.totalAdmins ?? 0)}
          text="Admin accounts"
        />

        <StatCard
          tone="pink"
          icon={<UserPlus size={20} />}
          title="New Users (7 days)"
          value={show(stats.newUsersLast7Days ?? 0)}
          text="Recent signups"
        />

        <StatCard
          tone="green"
          icon={<Activity size={20} />}
          title="Activity (24h)"
          value={show(stats.actionsLast24Hours ?? 0)}
          text="Logins and changes"
        />

        <StatCard
          tone="teal"
          icon={<LogIn size={20} />}
          title="Logins (24h)"
          value={show(logins)}
          text="Successful logins"
        />

        <StatCard
          tone={failed > 0 ? "red" : "slate"}
          icon={<TriangleAlert size={20} />}
          title="Failed Logins (24h)"
          value={show(failed)}
          text="Wrong password / unknown"
        />
      </div>

      <div className="adm-row-a">
        <section className="adm-card adm-col-card">
          <div className="adm-card-head">
            <div>
              <h2>User Registrations (Last 30 Days)</h2>
            </div>
          </div>

          <div className="adm-chart-meta">
            <div>
              <span>Total New Users (30 days)</span>

              <strong>{registrations.total}</strong>
            </div>

            <div>
              <span>Growth vs previous 30 days</span>

              <strong className={registrations.growthTone}>
                {registrations.growth}
              </strong>
            </div>
          </div>

          <div className="adm-chart">
            <div className="adm-chart-y">
              <span>{registrations.max}</span>

              <span>{Math.round(registrations.max / 2)}</span>

              <span>0</span>
            </div>

            {registrations.days.map((day) => (
              <div
                className="adm-bar-col"
                key={day.date.toISOString()}
                title={`${formatDay(day.date)}: ${day.count} signup${
                  day.count === 1 ? "" : "s"
                }`}
              >
                <div
                  className={`adm-bar ${
                    day.count === 0 ? "zero" : ""
                  }`}
                  style={{
                    height:
                      day.count === 0
                        ? "3px"
                        : `${(day.count / registrations.max) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="adm-chart-x">
            <span>{formatDay(registrations.days[0].date)}</span>

            <span>{formatDay(registrations.days[14].date)}</span>

            <span>{formatDay(registrations.days[29].date)}</span>
          </div>
        </section>

        <section className="adm-card adm-col-card">
          <div className="adm-card-head">
            <div>
              <h2>Platform Snapshot</h2>

              <p>Students vs admins</p>
            </div>
          </div>

          <div className="adm-fill-body adm-snap-body">
            <Meter
              label="Students"
              value={stats.totalStudents ?? 0}
              total={totalUsers}
              tone="blue"
            />

            <Meter
              label="Admins"
              value={stats.totalAdmins ?? 0}
              total={totalUsers}
              tone="violet"
            />

            <div className="adm-mini">
              <span>Total Users</span>

              <strong>{show(totalUsers)}</strong>
            </div>
          </div>
        </section>

        <section className="adm-card adm-col-card">
          <div className="adm-card-head">
            <div>
              <h2>Login Security (24h)</h2>

              <p>Successful vs failed login attempts</p>
            </div>
          </div>

          <div className="adm-fill-body adm-sec-body">
            <SecurityRing logins={logins} failed={failed} />
          </div>
        </section>
      </div>

      <section className="adm-card adm-recent">
        <div className="adm-card-head">
          <div>
            <h2>Recent Activity</h2>

            <p>Latest logins and changes on the platform</p>
          </div>

          <button
            type="button"
            className="adm-btn-link"
            onClick={() => onNavigate("logs")}
          >
            View all
          </button>
        </div>

        <div className="adm-activity adm-activity-list">
          {recent.length === 0 ? (
            <div className="adm-empty">
              No activity recorded yet.
            </div>
          ) : (
            recent.map((log) => {
              const kind = getActionKind(log);
              const Icon = kind.icon;

              return (
                <div className="adm-activity-item" key={log.id}>
                  <div
                    className={`adm-activity-icon adm-tone-${kind.tone}`}
                  >
                    <Icon size={17} />
                  </div>

                  <div className="adm-activity-main">
                    <strong>
                      {log.userName || "Unknown"} - {log.action}
                    </strong>

                    <span>
                      {formatDateTime(log.createdAt)}
                      {log.details ? ` • ${log.details}` : ""}
                    </span>
                  </div>

                  <span
                    className={`adm-pill ${
                      log.success
                        ? "adm-pill-green"
                        : "adm-pill-red"
                    }`}
                  >
                    {log.success ? "Success" : "Failed"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ tone, icon, title, value, text }) {
  return (
    <div className="adm-stat">
      <div className={`adm-stat-icon adm-tone-${tone}`}>
        {icon}
      </div>

      <div className="adm-stat-body">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{text}</small>
      </div>
    </div>
  );
}

function Meter({ label, value, total, tone }) {
  const percent =
    total > 0
      ? Math.min(100, Math.round((value / total) * 100))
      : 0;

  return (
    <div className="adm-meter">
      <div className="adm-meter-top">
        <span>{label}</span>

        <strong>
          {value} / {total} ({percent}%)
        </strong>
      </div>

      <div className="adm-track">
        <div
          className={`adm-fill ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SecurityRing({ logins, failed }) {
  const attempts = logins + failed;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const rate =
    attempts > 0 ? Math.round((logins / attempts) * 100) : 0;

  let color = "#cbd5e1";
  let label = "No attempts";

  if (attempts > 0) {
    if (rate >= 90) {
      color = "#16a34a";
      label = "Good";
    } else if (rate >= 70) {
      color = "#d97706";
      label = "Fair";
    } else {
      color = "#dc2626";
      label = "At risk";
    }
  }

  return (
    <div className="adm-ring-wrap">
      <div className="adm-ring">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#edf0f6"
            strokeWidth="12"
          />

          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${
              (rate / 100) * circumference
            } ${circumference}`}
          />
        </svg>

        <div className="adm-ring-center">
          <strong>{attempts > 0 ? `${rate}%` : "-"}</strong>

          <span style={{ color }}>{label}</span>
        </div>
      </div>

      <div className="adm-ring-legend">
        <div className="adm-legend-row">
          <span>
            <i
              className="adm-dot"
              style={{ background: "#16a34a" }}
            />
            Successful logins
          </span>

          <strong>{logins}</strong>
        </div>

        <div className="adm-legend-row">
          <span>
            <i
              className="adm-dot"
              style={{ background: "#dc2626" }}
            />
            Failed logins
          </span>

          <strong>{failed}</strong>
        </div>
      </div>
    </div>
  );
}

// Last 30 din ke signups (Students list ke createdAt se)
function buildRegistrations(signupDates) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push({ date, count: 0 });
  }

  const start = days[0].date.getTime();
  const previousStart = start - 30 * 86400000;

  let total = 0;
  let previous = 0;

  signupDates.forEach((signupDate) => {
    const created = new Date(signupDate);

    if (Number.isNaN(created.getTime())) return;

    created.setHours(0, 0, 0, 0);

    const time = created.getTime();

    if (time >= start) {
      const index = Math.round((time - start) / 86400000);

      if (days[index]) {
        days[index].count += 1;
        total += 1;
      }
    } else if (time >= previousStart) {
      previous += 1;
    }
  });

  const max = Math.max(4, ...days.map((day) => day.count));

  let growth = "-";
  let growthTone = "";

  if (previous > 0) {
    const change = Math.round(((total - previous) / previous) * 100);

    growth = `${change > 0 ? "+" : ""}${change}%`;
    growthTone = change >= 0 ? "up" : "down";
  } else if (total > 0) {
    growth = "New";
    growthTone = "up";
  }

  return { days, total, max, growth, growthTone };
}

function getActionKind(log) {
  const action = (log.action || "").toLowerCase();

  if (!log.success || action.includes("failed")) {
    return { icon: TriangleAlert, tone: "red" };
  }

  if (action.includes("login")) {
    return { icon: LogIn, tone: "green" };
  }

  if (action.includes("register")) {
    return { icon: UserPlus, tone: "pink" };
  }

  if (action.includes("delete")) {
    return { icon: Trash2, tone: "red" };
  }

  if (action.includes("password")) {
    return { icon: KeyRound, tone: "amber" };
  }

  if (action.includes("update") || action.includes("create")) {
    return { icon: Pencil, tone: "blue" };
  }

  return { icon: Activity, tone: "slate" };
}

function formatDay(date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default AdminOverview;
