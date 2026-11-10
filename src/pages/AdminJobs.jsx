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

function clean(category, data) {
  const payload = { ...data, category };

  if (payload.link === undefined || payload.link === null) {
    payload.link = "";
  }

  [
    "startDate",
    "lastDate",
    "examDate",
    "postDate",
    "syllabus",
    "details",
    "status",
  ].forEach((key) => {
    if (payload[key] === "") payload[key] = null;
  });

  return payload;
}

function normName(value) {
  return (value || "").trim().replace(/\\s+/g, " ").toLowerCase();
}

async function warnIfDuplicate(category, name, excludeId) {
  const key = normName(name);
  if (!key) return;

  const response = await getJobPosts(category, {
    includeDrafts: true,
    take: 500,
  });
  const list = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  const duplicate = list.find(
    (item) =>
      item.id !== excludeId &&
      normName(item.examName || item.title || item.name) === key
  );

  if (duplicate) {
    const proceed = window.confirm(
      `"${name}" already exists in this section. Do you still want to save it?`
    );

    if (!proceed) {
      throw new Error("Save cancelled because a duplicate entry exists.");
    }
  }
}

function AdminJobs() {
  const [activeTab, setActiveTab] = useState("Job");
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function handlePublish(item, loadData) {
    try {
      setBusyId(item.id);
      setMessage("");
      await setJobPublished(item.id, item.publishStatus !== "Published");
      await loadData();
      window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
    } catch (error) {
      setMessage(error.message || "Unable to update visibility.");
    } finally {
      setBusyId(null);
    }
  }

  const tabs = (
    <div className="adm-jobs-tabs">
      {TABS.map((tab) => (
        <button
          type="button"
          key={tab.key}
          className={`adm-jobs-tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (activeTab === "Ebook") {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Content Manager</h1>
            <p>Manage jobs, exams, results, admit cards and ebooks.</p>
          </div>
        </div>
        <ContentSummary />

        {tabs}
        <AdminEbooks key={refreshKey} />
      </div>
    );
  }

  const fields = [
    {
      name: "examName",
      label: "Exam / Job Name",
      required: true,
      fullWidth: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      fullWidth: true,
    },
    { name: "link", label: "Application / Official Link", type: "url" },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "lastDate", label: "Last Date", type: "date" },
    { name: "examDate", label: "Exam Date", type: "date" },
    { name: "postDate", label: "Post Date", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    {
      name: "syllabus",
      label: "Syllabus",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "details",
      label: "Details / Video URL",
      type: "textarea",
      fullWidth: true,
    },
  ];

  const columns =
    activeTab === "Job"
      ? [
          { key: "examName", label: "Exam / Job Name" },
          { key: "startDate", label: "Start Date", type: "date" },
          { key: "lastDate", label: "Last Date", type: "date" },
          { key: "status", label: "Status" },
          {
            key: "publishStatus",
            label: "Visibility",
            render: (item) => item.publishStatus || "Published",
          },
        ]
      : [
          { key: "examName", label: "Exam Name" },
          { key: "postDate", label: "Post Date", type: "date" },
          { key: "status", label: "Status" },
          {
            key: "publishStatus",
            label: "Visibility",
            render: (item) => item.publishStatus || "Published",
          },
        ];

  const service = {
    get: () =>
      getJobPosts(activeTab, {
        includeDrafts: true,
        take: 500,
      }),
    create: async (data) => {
      await warnIfDuplicate(activeTab, data.examName);
      const result = await createJobPost(clean(activeTab, data));
      window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
      return result;
    },
    update: async (id, data) => {
      await warnIfDuplicate(activeTab, data.examName, id);
      const result = await updateJobPost(id, clean(activeTab, data));
      window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
      return result;
    },
    delete: async (id) => {
      const result = await deleteJobPost(id);
      window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT));
      return result;
    },
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Content Manager</h1>
          <p>Manage jobs, exams, results, admit cards and ebooks.</p>
        </div>
        </div>
        <ContentSummary />

      {tabs}

      {message && <div className="error-box">{message}</div>}

      <CrudPage
        key={`${activeTab}-${refreshKey}`}
        title={TABS.find((tab) => tab.key === activeTab)?.label || "Content"}
        description=""
        fields={fields}
        columns={columns}
        service={service}
        emptyMessage="No records found"
        extraActions={(item, loadData) => (
          <button
            type="button"
            className="edit-button"
            title={
              item.publishStatus === "Published"
                ? "Move to Draft"
                : "Publish"
            }
            disabled={busyId === item.id}
            onClick={() => handlePublish(item, loadData)}
          >
            {item.publishStatus === "Published" ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        )}
      />

      <div className="admin-jobs-note">
        <Eye size={14} /> Published items are visible to students. Draft items remain admin-only.
      </div>
    </div>
  );
}

export default AdminJobs;
