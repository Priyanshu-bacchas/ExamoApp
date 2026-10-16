import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, UserPlus } from "lucide-react";

import {
  getSystemMetrics,
  getUserAnalytics,
} from "../services/adminService";
import {
  WebServiceCard,
  DatabaseCard,
} from "../components/SystemHealth";

const DAY = 86400000;

function AdminAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User analytics: ek baar (Refresh se dobara)
  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics(fresh = false) {
    try {
      setLoading(true);
      setError("");

      setData(await getUserAnalytics(fresh));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  // Web service + database health: har 10 second me update
  useEffect(() => {
    let alive = true;

    async function loadMetrics() {
      if (document.hidden) return;

      try {
        const result = await getSystemMetrics();

        if (alive) {
          setMetrics(result);
          setMetricsError(false);
        }
      } catch {
        if (alive) setMetricsError(true);
      }
    }

    loadMetrics();

    const timer = setInterval(loadMetrics, 10000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  function handleRefresh() {
    loadAnalytics(true);
  }

  const stats = buildAnalytics(data);

  const maxCumulative = Math.max(4, ...stats.cumulative);
  const maxDaily = Math.max(1, ...stats.daily);

  return (
    <div>
      <div className="adm-heading">
        <div>
          <h1>Platform Analytics</h1>
        </div>

        <button
          type="button"
          className="adm-btn"
          onClick={handleRefresh}
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

      <div className="adm-an-grid-1">
        <WebServiceCard metrics={metrics} error={metricsError} />

        <DatabaseCard metrics={metrics} error={metricsError} />
      </div>

      <div className="adm-an-grid-2">
        <section className="adm-card adm-life">
          <div className="adm-card-head">
            <div className="adm-head-title">
              <span className="adm-head-icon adm-tone-blue">
                <TrendingUp size={16} />
              </span>

              <div>
                <h2>Deep Analytics: User Lifecycle</h2>
              </div>
            </div>

            <div className="adm-legend-chips">
              <span>
                <i style={{ background: "#2563eb" }} />
                Total users
              </span>

              <span>
                <i style={{ background: "#7c9cf5" }} />
                New signups
              </span>
            </div>
          </div>

          <div className="adm-chart-meta">
            <div>
              <span>Total New Users (30 days)</span>

              <strong>{stats.total30}</strong>
            </div>

            <div>
              <span>Growth vs previous 30 days</span>

              <strong className={stats.growthTone}>
                {stats.growth}
              </strong>
            </div>

            <div>
              <span>Retention</span>

              <strong>{stats.retention}</strong>
            </div>
          </div>

          <div className="adm-life-body">
            <div>
              <div className="adm-life-chart">
                <div className="adm-chart-y">
                  <span>{maxCumulative}</span>

                  <span>{Math.round(maxCumulative / 2)}</span>

                  <span>0</span>
                </div>

                <LifecycleChart
                  cumulative={stats.cumulative}
                  daily={stats.daily}
                  days={stats.days}
                  maxCumulative={maxCumulative}
                  maxDaily={maxDaily}
                />
              </div>

              <div className="adm-chart-x adm-life-x">
                <span>{formatDay(stats.days[0])}</span>

                <span>{formatDay(stats.days[14])}</span>

                <span>{formatDay(stats.days[29])}</span>
              </div>
            </div>

            <div className="adm-cohorts">
              <div className="adm-cohorts-title">
                Cohorts (signup week)
              </div>

              {stats.cohorts.map((cohort) => (
                <div className="adm-cohort" key={cohort.label}>
                  <div className="adm-cohort-top">
                    <span>{cohort.label}</span>

                    <strong>
                      {cohort.count}
                      <small>
                        {" "}
                        ({cohort.share}%)
                      </small>
                    </strong>
                  </div>

                  <div className="adm-track">
                    <div
                      className="adm-fill violet"
                      style={{ width: `${cohort.retention}%` }}
                    />
                  </div>

                  <div className="adm-cohort-note">
                    {cohort.count > 0
                      ? `${cohort.retained}/${cohort.count} returned (${cohort.retention}%)`
                      : "No signups"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="adm-an-right">
          <section className="adm-card adm-growth">
            <div className="adm-card-head">
              <div className="adm-head-title">
                <span className="adm-head-icon adm-tone-pink">
                  <UserPlus size={16} />
                </span>

                <div>
                  <h2>Current Growth</h2>

                  <p>Daily signups, last 30 days</p>
                </div>
              </div>
            </div>

            <BarChart
              values={stats.daily}
              titles={stats.days.map(
                (day, index) =>
                  `${formatDay(day)}: ${stats.daily[index]} signup${
                    stats.daily[index] === 1 ? "" : "s"
                  }`
              )}
              xLabels={[
                formatDay(stats.days[0]),
                formatDay(stats.days[14]),
                formatDay(stats.days[29]),
              ]}
            />
          </section>

          <section className="adm-card adm-growth">
            <div className="adm-card-head">
              <div className="adm-head-title">
                <span className="adm-head-icon adm-tone-violet">
                  <TrendingUp size={16} />
                </span>

                <div>
                  <h2>Historical Growth</h2>

                  <p>Monthly signups, last 6 months</p>
                </div>
              </div>
            </div>

            <BarChart
              values={stats.monthly.map((item) => item.count)}
              titles={stats.monthly.map(
                (item) => `${item.label}: ${item.count}`
              )}
              xLabels={stats.monthly.map((item) => item.label)}
              labelAll
              showValues
              tone="violet"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

// Cumulative users (area) + daily signups (bars)
function LifecycleChart({
  cumulative,
  daily,
  days,
  maxCumulative,
  maxDaily,
}) {
  const width = 600;
  const height = 220;
  const slot = width / 30;

  const points = cumulative
    .map((value, index) => {
      const x = (index * (width / 29)).toFixed(1);
      const y = (
        height -
        (value / maxCumulative) * (height - 12)
      ).toFixed(1);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="adm-life-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="adm-life-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#adm-life-grad)"
      />

      {daily.map((value, index) => {
        const barHeight = (value / maxDaily) * height * 0.42;

        return (
          <rect
            key={index}
            x={index * slot + slot * 0.2}
            y={height - barHeight}
            width={slot * 0.6}
            height={Math.max(barHeight, value > 0 ? 3 : 0)}
            rx="2"
            fill="#7c9cf5"
            opacity="0.85"
          >
            <title>
              {`${formatDay(days[index])}: ${value} signup${
                value === 1 ? "" : "s"
              }, total ${cumulative[index]}`}
            </title>
          </rect>
        );
      })}

      <polyline
        points={points}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Simple HTML bar chart
function BarChart({
  values,
  titles,
  xLabels,
  labelAll = false,
  showValues = false,
  tone = "blue",
}) {
  const max = Math.max(1, ...values);

  return (
    <div className="adm-bars-wrap">
      <div className="adm-bars">
        {values.map((value, index) => (
          <div
            className="adm-bars-col"
            key={index}
            title={titles[index]}
          >
            {showValues && (
              <span className="adm-bars-val">{value}</span>
            )}

            <div
              className={`adm-bars-bar ${tone} ${
                value === 0 ? "zero" : ""
              }`}
              style={{
                height: value === 0 ? "3px" : `${(value / max) * 100}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div
        className={`adm-bars-x ${labelAll ? "all" : ""}`}
      >
        {xLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// Signups (local time) se saare charts ka data
function buildAnalytics(data) {
  const signups = (data?.signups || [])
    .map((item) => ({
      date: new Date(item.createdAt),
      retained: Boolean(item.retained),
    }))
    .filter((item) => !Number.isNaN(item.date.getTime()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysAgo = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);

    return Math.round((today - copy) / DAY);
  };

  const daily = Array(30).fill(0);

  const cohorts = [
    { label: "Last 7 days", from: 0, to: 6 },
    { label: "8-14 days ago", from: 7, to: 13 },
    { label: "15-21 days ago", from: 14, to: 20 },
    { label: "22-30 days ago", from: 21, to: 29 },
  ].map((cohort) => ({ ...cohort, count: 0, retained: 0 }));

  let previous = 0;

  signups.forEach((signup) => {
    const ago = daysAgo(signup.date);

    if (ago < 0) return;

    if (ago <= 29) {
      daily[29 - ago] += 1;

      const cohort = cohorts.find(
        (item) => ago >= item.from && ago <= item.to
      );

      cohort.count += 1;

      if (signup.retained) cohort.retained += 1;
    } else if (ago <= 59) {
      previous += 1;
    }
  });

  const total30 = daily.reduce((sum, value) => sum + value, 0);

  let growth = "-";
  let growthTone = "";

  if (previous > 0) {
    const change = Math.round(((total30 - previous) / previous) * 100);

    growth = `${change > 0 ? "+" : ""}${change}%`;
    growthTone = change >= 0 ? "up" : "down";
  } else if (total30 > 0) {
    growth = "New";
    growthTone = "up";
  }

  // Total users har din ke end par
  const totalUsers = data?.totalUsers ?? 0;
  const cumulative = Array(30).fill(0);

  cumulative[29] = totalUsers;

  for (let i = 28; i >= 0; i--) {
    cumulative[i] = Math.max(0, cumulative[i + 1] - daily[i + 1]);
  }

  const days = Array.from(
    { length: 30 },
    (_, index) => new Date(today.getTime() - (29 - index) * DAY)
  );

  const retainedTotal = cohorts.reduce(
    (sum, item) => sum + item.retained,
    0
  );

  cohorts.forEach((cohort) => {
    cohort.share =
      total30 > 0 ? Math.round((cohort.count / total30) * 100) : 0;

    cohort.retention =
      cohort.count > 0
        ? Math.round((cohort.retained / cohort.count) * 100)
        : 0;
  });

  // Last 6 months
  const monthly = [];

  for (let m = 5; m >= 0; m--) {
    const start = new Date(today.getFullYear(), today.getMonth() - m, 1);

    const end = new Date(
      today.getFullYear(),
      today.getMonth() - m + 1,
      1
    );

    monthly.push({
      label: start.toLocaleDateString("en-IN", { month: "short" }),
      count: signups.filter(
        (signup) => signup.date >= start && signup.date < end
      ).length,
    });
  }

  return {
    daily,
    days,
    cumulative,
    cohorts,
    monthly,
    total30,
    growth,
    growthTone,
    retention:
      total30 > 0
        ? `${Math.round((retainedTotal / total30) * 100)}%`
        : "-",
  };
}

function formatDay(date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export default AdminAnalytics;
