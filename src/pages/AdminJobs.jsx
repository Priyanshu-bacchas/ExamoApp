import { useState } from "react";

import CrudPage from "../components/CrudPage";
import {
  getJobPosts,
  createJobPost,
  updateJobPost,
  deleteJobPost,
} from "../services/jobService";

import "./AdminJobs.css";

const TABS = [
  { key: "Job", label: "Latest Jobs" },
  { key: "Exam", label: "Exam" },
  { key: "Result", label: "Results" },
  { key: "AdmitCard", label: "Admit Cards" },
];

const STATUS_OPTIONS = ["Out", "Upcoming"];

// Khaali date / status ko null banao taaki backend ko sahi value mile
function clean(category, data) {
  const payload = { ...data, category };

  // Exam section me link nahi hota - backend ko khaali string bhejo
  if (payload.link === undefined || payload.link === null) payload.link = "";

  ["startDate", "lastDate", "examDate", "syllabus", "details", "postDate", "status"].forEach((key) => {
    if (payload[key] === "") payload[key] = null;
  });

  return payload;
}

function makeService(category) {
  return {
    get: () => getJobPosts(category),
    create: (data) => createJobPost(clean(category, data)),
    update: (id, data) => updateJobPost(id, clean(category, data)),
    delete: (id) => deleteJobPost(id),
  };
}

const SERVICES = {
  Job: makeService("Job"),
  Exam: makeService("Exam"),
  Result: makeService("Result"),
  AdmitCard: makeService("AdmitCard"),
};

// Sirf http / https link hi khulte hain
function linkCell(item) {
  if (!item.link || !/^https?:\/\//i.test(item.link)) return "-";

  return (
    <a
      className="table-link"
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open
    </a>
  );
}

function statusCell(item) {
  return (
    <span
      className={`status-badge ${
        item.status === "Out" ? "status-filled" : "status-pending"
      }`}
    >
      {item.status || "-"}
    </span>
  );
}

// Lamba syllabus table me chhota dikhao
function syllabusCell(item) {
  if (!item.syllabus) return "-";

  return item.syllabus.length > 60
    ? `${item.syllabus.slice(0, 60)}...`
    : item.syllabus;
}

// Details = YouTube video link (table me "Watch" link)
function detailsCell(item) {
  if (!item.details || !/^https?:\/\//i.test(item.details)) return "-";

  return (
    <a
      className="table-link"
      href={item.details}
      target="_blank"
      rel="noopener noreferrer"
    >
      Watch
    </a>
  );
}

const detailsField = {
  name: "details",
  label: "Details (YouTube link)",
  type: "url",
  fullWidth: true,
  placeholder: "https://www.youtube.com/watch?v=... (optional)",
};

// Exam section me Details zaroori hai
const examDetailsField = { ...detailsField, required: true };

const linkField = {
  name: "link",
  label: "Link",
  type: "url",
  required: true,
  placeholder: "https://",
  fullWidth: true,
};

const CONFIG = {
  // ---- Latest Jobs: Exam Name, Start Date, Last Date, Exam Date, Syllabus, Details, Link ----
  Job: {
    title: "Latest Job",
    description: "Jobs shown to students in the Jobs section.",
    emptyMessage: "No jobs added yet.",
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "lastDate", label: "Last Date", type: "date" },
      { key: "examDate", label: "Exam Date", type: "date" },
      { key: "syllabus", label: "Syllabus", render: syllabusCell },
      { key: "details", label: "Details", render: detailsCell },
      { key: "link", label: "Link", render: linkCell },
    ],
    fields: [
      { name: "examName", label: "Exam Name", required: true, fullWidth: true },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "lastDate", label: "Last Date", type: "date", required: true },
      { name: "examDate", label: "Exam Date", type: "date" },
      {
        name: "syllabus",
        label: "Syllabus",
        type: "textarea",
        fullWidth: true,
        placeholder: "Syllabus / topics (optional)",
      },
      detailsField,
      linkField,
    ],
  },

  // ---- Exam: Exam Form (naam), Details (video link) ----
  Exam: {
    title: "Exam",
    description:
      "Exam form ke naam ke saath video link do. Student ke Exam Forms page par isi naam ke saamne video dikhta hai.",
    emptyMessage: "No exam details added yet.",
    columns: [
      { key: "examName", label: "Exam Form" },
      { key: "details", label: "Details", render: detailsCell },
    ],
    fields: [
      {
        name: "examName",
        label: "Exam Form",
        required: true,
        fullWidth: true,
        placeholder: "Exam form ka naam (student ke Exam Name jaisa)",
      },
      examDetailsField,
    ],
  },

  // ---- Result: Exam Name, Date, Status, Details, Link ----
  Result: {
    title: "Result",
    description: "Results shown to students on the Notifications page.",
    emptyMessage: "No results added yet.",
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "postDate", label: "Date", type: "date" },
      { key: "status", label: "Status", render: statusCell },
      { key: "details", label: "Details", render: detailsCell },
      { key: "link", label: "Link", render: linkCell },
    ],
    fields: [
      { name: "examName", label: "Exam Name", required: true, fullWidth: true },
      { name: "postDate", label: "Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
        defaultValue: "Out",
        required: true,
      },
      detailsField,
      linkField,
    ],
  },

  // ---- Admit Card: Exam Name, Date, Status, Details, Link ----
  AdmitCard: {
    title: "Admit Card",
    description: "Admit cards shown to students on the Notifications page.",
    emptyMessage: "No admit cards added yet.",
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "postDate", label: "Date", type: "date" },
      { key: "status", label: "Status", render: statusCell },
      { key: "details", label: "Details", render: detailsCell },
      { key: "link", label: "Link", render: linkCell },
    ],
    fields: [
      { name: "examName", label: "Exam Name", required: true, fullWidth: true },
      { name: "postDate", label: "Date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
        defaultValue: "Out",
        required: true,
      },
      detailsField,
      linkField,
    ],
  },
};

function AdminJobs() {
  const [tab, setTab] = useState("Job");

  const config = CONFIG[tab];

  return (
    <div className="adm-jobs">
      <div className="adm-jobs-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`adm-jobs-tab ${tab === item.key ? "active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* key: tab badalte hi table dobara load hoti hai */}
      <CrudPage
        key={tab}
        title={config.title}
        description={config.description}
        emptyMessage={config.emptyMessage}
        service={SERVICES[tab]}
        columns={config.columns}
        fields={config.fields}
      />
    </div>
  );
}

export default AdminJobs;
