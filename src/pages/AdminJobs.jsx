import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import CrudPage from "../components/CrudPage";
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

  // Edit me naam nahi badla ho to warning nahi
  const self = excludeId ? list.find((x) => x.id === excludeId) : null;

  if (self && normName(self.examName) === key) return;

  const duplicate = list.find(
    (x) => x.id !== excludeId && normName(x.examName) === key
  );

  if (!duplicate) return;

  const where = TABS.find((t) => t.key === category)?.label || category;
  const draftNote = duplicate.publishStatus === "Draft" ? " (Draft)" : "";

  const ok = window.confirm(
    `Duplicate warning\n\n"${duplicate.examName}" already exists in ${where}${draftNote}.\n\nDo you still want to save this entry?`
  );

  if (!ok) {
    throw new Error("Not saved: an entry with this name already exists.");
  }
}

function makeService(category) {
  return {
    // Admin ko Draft entries bhi dikhti hain
    get: () => getJobPosts(category, { includeDrafts: true }),
    create: async (data) => {
      await warnIfDuplicate(category, data.examName, null);

      return createJobPost(clean(category, data));
    },
    update: async (id, data) => {
      await warnIfDuplicate(category, data.examName, id);

      return updateJobPost(id, clean(category, data));
    },
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

// Published = students ko dikhta hai, Draft = sirf admin ko
function visibilityCell(item) {
  const draft = item.publishStatus === "Draft";

  return (
    <span
      className={`status-badge ${draft ? "status-pending" : "status-filled"}`}
    >
      {draft ? "Draft" : "Published"}
    </span>
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

const visibilityField = {
  name: "publishStatus",
  label: "Visibility",
  type: "select",
  options: ["Published", "Draft"],
  defaultValue: "Published",
  required: true,
};

const visibilityColumn = {
  key: "publishStatus",
  label: "Visibility",
  render: visibilityCell,
};

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
      visibilityColumn,
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
      visibilityField,
    ],
  },

  // ---- Exam: Exam Form (naam), Details (video link) ----
  Exam: {
    title: "Exam",
    description:
      "Entries Latest Job add karte hi apne aap ban jati hain (Draft). Edit me video link (Details) daalo aur Publish karo. Student ke Exam Forms page par isi naam ke saamne video dikhta hai.",
    emptyMessage: "Entries appear here automatically when you add a Latest Job.",
    columns: [
      { key: "examName", label: "Exam Form" },
      { key: "details", label: "Details", render: detailsCell },
      visibilityColumn,
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
      visibilityField,
    ],
  },

  // ---- Result: Exam Name, Date, Status, Details, Link ----
  Result: {
    title: "Result",
    description:
      "Entries Latest Job add karte hi apne aap ban jati hain (Draft). Edit me date, status aur Details daalo, phir Publish karo.",
    emptyMessage: "Entries appear here automatically when you add a Latest Job.",
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "postDate", label: "Date", type: "date" },
      { key: "status", label: "Status", render: statusCell },
      { key: "details", label: "Details", render: detailsCell },
      visibilityColumn,
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
      visibilityField,
    ],
  },

  // ---- Admit Card: Exam Name, Date, Status, Details, Link ----
  AdmitCard: {
    title: "Admit Card",
    description:
      "Entries Latest Job add karte hi apne aap ban jati hain (Draft). Edit me date, status aur Details daalo, phir Publish karo.",
    emptyMessage: "Entries appear here automatically when you add a Latest Job.",
    columns: [
      { key: "examName", label: "Exam Name" },
      { key: "postDate", label: "Date", type: "date" },
      { key: "status", label: "Status", render: statusCell },
      { key: "details", label: "Details", render: detailsCell },
      visibilityColumn,
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
      visibilityField,
    ],
  },
};

function AdminJobs() {
  const [tab, setTab] = useState("Job");

  const config = CONFIG[tab];

  async function togglePublish(item, reload) {
    try {
      await setJobPublished(item.id, item.publishStatus === "Draft");
      await reload();
    } catch (error) {
      window.alert(error.message || "Could not change visibility.");
    }
  }

  function extraActions(item, reload) {
    const draft = item.publishStatus === "Draft";

    return (
      <>
        <button
          type="button"
          className="edit-button"
          title={draft ? "Publish (show to students)" : "Move to Draft (hide)"}
          onClick={() => togglePublish(item, reload)}
        >
          {draft ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </>
    );
  }

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
        extraActions={extraActions}
        hideAdd={tab !== "Job"}
      />

    </div>
  );
}

export default AdminJobs;
