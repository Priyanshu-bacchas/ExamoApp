import { useEffect, useState } from "react";

import CrudPage from "../components/CrudPage";
import VideoButton from "../components/VideoButton";
import { getJobPosts } from "../services/jobService";
import {
  getExamForms,
  createExamForm,
  updateExamForm,
  deleteExamForm,
} from "../services/examFormService";

// Naam match ke liye: chhote akshar, extra space hata ke
function nameKey(value) {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function ExamForms() {
  // Admin ke "Exam" section ki entries: exam form ka naam -> video link
  const [videos, setVideos] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      try {
        const data = await getJobPosts("Exam");
        const map = {};

        // Pehle naya (upar) rakhna hai, isliye pehli entry hi chalti hai
        (Array.isArray(data) ? data : []).forEach((entry) => {
          const key = nameKey(entry.examName);

          if (key && entry.details && !map[key]) map[key] = entry.details;
        });

        if (!cancelled) setVideos(map);
      } catch (err) {
        // Video na aaye to bhi Exam Forms chalte rahenge
        console.error(err);
      }
    }

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CrudPage
      title="Exam Forms"
      description="Manage examination application forms and deadlines."
      emptyMessage="No exam forms found."
      statusOnlyEdit
      hideAdd
      service={{
        get: getExamForms,
        create: createExamForm,
        update: updateExamForm,
        delete: deleteExamForm,
      }}
      columns={[
        {
          key: "examName",
          label: "Exam Name",
        },
        {
          key: "registerStartDate",
          label: "Start Date",
          type: "date",
        },
        {
          key: "registerEndDate",
          label: "End Date",
          type: "date",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => (
            <span
              className={`status-badge ${
                item.status === "Filled"
                  ? "status-filled"
                  : "status-pending"
              }`}
            >
              {item.status || "Pending"}
            </span>
          ),
        },
        {
          key: "details",
          label: "Details",
          render: (item) => (
            <VideoButton
              url={videos[nameKey(item.examName)]}
              title={item.examName}
            />
          ),
        },
        {
          key: "link",
          label: "Link",
          render: (item) =>
            item.link ? (
              <a
                className="table-link"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            ) : (
              "-"
            ),
        },
      ]}
      fields={[
        {
          name: "examName",
          label: "Exam Name",
          required: true,
        },
        {
          name: "registerStartDate",
          label: "Register Start Date",
          type: "date",
          required: true,
        },
        {
          name: "registerEndDate",
          label: "Register End Date",
          type: "date",
          required: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Filled", "Pending"],
          defaultValue: "Pending",
          editableOnEdit: true,
          required: true,
        },
        {
          name: "link",
          label: "Application Link",
          type: "url",
        },
      ]}
    />
  );
}

export default ExamForms;