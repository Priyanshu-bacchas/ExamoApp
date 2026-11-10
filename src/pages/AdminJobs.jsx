import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import CrudPage from "../components/CrudPage";
import AdminEbooks from "./AdminEbooks";
import ContentSummary, {
  CONTENT_CHANGED_EVENT,
} from "../components/ContentSummary";
import {
  getJobPosts,
  createJobPost,
  updateJobPost,
  deleteJobPost,
  setJobPublished,
} from "../services/jobService";

import "./AdminJobs.css";

const TABS = [
  { key: "Job", label: "Latest Jobs" },
  { key: "Exam", label: "Exam" },
  { key: "Result", label: "Results" },
  { key: "AdmitCard", label: "Admit Cards" },
  { key: "Ebook", label: "Ebook" },
];

const STATUS_OPTIONS = ["Out", "Upcoming"];

// Khaali date / status ko null banao taaki backend ko sahi value mile
function clean(category, data) {
  const payload = { ...data, category };
  if (payload.link === undefined || payload.link === null) payload.link = "";
  ["startDate", "lastDate", "examDate", "syllabus", "details", "postDate", "status"].forEach((key) => {
    if (payload[key] === "") payload[key] = null;
  });
  return payload;
}

function normName(value) {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

// Same naam ki entry pehle se ho to admin ko warning (confirm karke save bhi kar sakta hai)
async function warnIfDuplicate(category, name, excludeId) {
  const key = normName(name);
  if (!key) return;

  const response = await getJobPosts(category, {
    includeDrafts: true,
    take: 500,
  });
  const list = Array.isArray(response) ? response : [];

  const duplicate = list.find(
    (item) =>
      item.id !== excludeId &&
      normName(item.title || item.name) === key
  );

  if (duplicate) {
    const proceed = window.confirm(
      `"${name}" already exists in this section. Do you still want to save it?`
    );
    if (!proceed) throw new Error("Save cancelled because a duplicate entry exists.");
  }
}

function AdminJobs() {
  const [activeTab, setActiveTab] = useState("Job");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");

  async function handlePublish(item, published) {
    try {
      setBusyId(item.id);
      await setJobPublished(item.id, published);
      setRefreshKey((value) => value + 1);
      window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
    } catch (error) {
      setMessage(error.message || "Unable to update visibility.");
    } finally {
      setBusyId(null);
    }
  }

  if (activeTab === "Ebook") {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Content Manager</h1>
            <p>Manage jobs, exams, results, admit cards and ebooks.</p>
          </div>
        </div>
        <div className="admin-jobs-tabs">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <AdminEbooks key={refreshKey} />
      </div>
    );
  }

  const fields = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "link", label: "Link", type: "url" },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "lastDate", label: "Last Date", type: "date" },
    { name: "examDate", label: "Exam Date", type: "date" },
    { name: "postDate", label: "Post Date", type: "date" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    { name: "syllabus", label: "Syllabus", type: "textarea" },
    { name: "details", label: "Details", type: "textarea" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Content Manager</h1>
          <p>Manage jobs, exams, results, admit cards and ebooks.</p>
        </div>
        <ContentSummary />
      </div>

      <div className="admin-jobs-tabs">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && <div className="error-box">{message}</div>}

      <CrudPage
        key={`${activeTab}-${refreshKey}`}
        title={TABS.find((tab) => tab.key === activeTab)?.label || "Content"}
        fields={fields}
        loadItems={(options) => getJobPosts(activeTab, options)}
        createItem={async (data) => {
          await warnIfDuplicate(activeTab, data.title);
          return createJobPost(clean(activeTab, data));
        }}
        updateItem={async (id, data) => {
          await warnIfDuplicate(activeTab, data.title, id);
          return updateJobPost(id, clean(activeTab, data));
        }}
        deleteItem={(id) => deleteJobPost(id)}
      />
      <div className="admin-jobs-note">
        <Eye size={14} /> Published items are visible to students. Draft items remain admin-only.
      </div>
    </div>
  );
}

export default AdminJobs;