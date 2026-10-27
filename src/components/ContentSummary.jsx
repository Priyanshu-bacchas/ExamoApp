import { useEffect, useState } from "react";

import { getJobPosts } from "../services/jobService";

import "./ContentSummary.css";

// Content Manager ke upar: ek nazar me kaam kya baaki hai
export const CONTENT_CHANGED_EVENT = "content-changed";

const CATEGORIES = [
  { key: "Job", label: "Jobs" },
  { key: "Exam", label: "Exam" },
  { key: "Result", label: "Results" },
  { key: "AdmitCard", label: "Admit Cards" },
];

const CLOSING_DAYS = 3;

// "2026-11-06" -> local din (time ke bina)
function parseDay(value) {
  if (!value) return null;

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function daysLeft(value) {
  const day = parseDay(value);

  if (!day) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((day - today) / 86400000);
}

function ContentSummary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const results = await Promise.all(
        CATEGORIES.map((category) =>
          getJobPosts(category.key, { includeDrafts: true, take: 500 })
        )
      );

      const next = {};

      CATEGORIES.forEach((category, index) => {
        next[category.key] = Array.isArray(results[index])
          ? results[index]
          : [];
      });

      setData(next);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load the summary.");
    }
  }

  useEffect(() => {
    load();

    // Add / Edit / Delete / Publish ke baad counts apne aap badal jaate hain
    window.addEventListener(CONTENT_CHANGED_EVENT, load);

    return () => window.removeEventListener(CONTENT_CHANGED_EVENT, load);
  }, []);

  if (error) return <div className="cs-error">{error}</div>;

  if (!data) return <div className="cs-loading">Loading summary...</div>;

  const drafts = {};
  let draftTotal = 0;
  let publishedTotal = 0;
  let total = 0;

  CATEGORIES.forEach((category) => {
    const list = data[category.key];
    const draftCount = list.filter((x) => x.publishStatus === "Draft").length;

    drafts[category.key] = draftCount;
    draftTotal += draftCount;
    publishedTotal += list.length - draftCount;
    total += list.length;
  });

  // Last date 0 se 3 din ke andar wali jobs (sabse nazdeek pehle)
  const closing = data.Job.map((job) => ({
    job,
    left: daysLeft(job.lastDate),
  }))
    .filter((x) => x.left !== null && x.left >= 0 && x.left <= CLOSING_DAYS)
    .sort((a, b) => a.left - b.left);

  return (
    <div className="cs-wrap">
      <div className="cs-grid">
        <div className="cs-card cs-draft">
          <span className="cs-label">Draft entries</span>
          <strong className="cs-number">{draftTotal}</strong>
          <span className="cs-sub">
            {CATEGORIES.map(
              (category) => `${category.label} ${drafts[category.key]}`
            ).join(" · ")}
          </span>
        </div>

        <div className="cs-card cs-published">
          <span className="cs-label">Published</span>
          <strong className="cs-number">{publishedTotal}</strong>
          <span className="cs-sub">Visible to students</span>
        </div>

        <div className="cs-card cs-closing">
          <span className="cs-label">
            Jobs closing in {CLOSING_DAYS} days
          </span>
          <strong className="cs-number">{closing.length}</strong>
          <span className="cs-sub">
            {closing.length === 0
              ? "No job is closing soon"
              : closing
                  .slice(0, 2)
                  .map(
                    ({ job, left }) =>
                      `${job.examName} (${left === 0 ? "today" : `${left}d`})`
                  )
                  .join(", ") +
                (closing.length > 2 ? ` +${closing.length - 2} more` : "")}
          </span>
        </div>

        <div className="cs-card">
          <span className="cs-label">Total entries</span>
          <strong className="cs-number">{total}</strong>
          <span className="cs-sub">Across all sections</span>
        </div>
      </div>
    </div>
  );
}

export default ContentSummary;
