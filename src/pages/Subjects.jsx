import { useState } from "react";

import CrudPage from "../components/CrudPage";
import { apiGet } from "../services/api";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  uploadSubjectPdf,
} from "../services/subjectService";

// PDF kholne ka temporary (10 min) link: backend Supabase se banata hai
// (yahin define hai, taaki subjectService.js me kuch badalna na pade)
const getSubjectPdfLink = async (id) => {
  const data = await apiGet(`/Subjects/${id}/pdf-url`);

  return data?.url || "";
};

// PDF private storage me hai: click par backend se temporary link leke kholte hain
function OpenPdfLink({ item }) {
  const [busy, setBusy] = useState(false);

  async function handleOpen(event) {
    event.preventDefault();

    // Popup blocker se bachne ke liye tab pehle hi khol lete hain
    const tab = window.open("", "_blank");

    try {
      setBusy(true);

      const url = await getSubjectPdfLink(item.id);

      if (!url) throw new Error("PDF link not found.");

      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      if (tab) tab.close();

      window.alert(
        err.message || "Unable to open PDF."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <a
      className="table-link"
      href="#"
      onClick={handleOpen}
    >
      {busy ? "Opening..." : "Open PDF"}
    </a>
  );
}

function Subjects() {
  return (
    <CrudPage
      title="Subjects"
      description="Manage subjects, study materials and useful resources."
      emptyMessage="No subjects found."
      service={{
        get: getSubjects,
        create: createSubject,
        update: updateSubject,
        delete: deleteSubject,
        uploadFile: uploadSubjectPdf,
      }}
      columns={[
        {
          key: "subjectName",
          label: "Subject",
        },
        {
          key: "materials",
          label: "Materials",
        },
        {
          key: "lectures",
          label: "Lecture",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => (
            <span
              className={`status-badge ${getStatusClass(
                item.status
              )}`}
            >
              {item.status}
            </span>
          ),
        },
        {
          key: "pdf",
          label: "PDF Lecture",
          render: (item) =>
            item.pdf ? (
              <OpenPdfLink item={item} />
            ) : (
              "-"
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
          name: "subjectName",
          label: "Subject",
          required: true,
        },
        {
          name: "materials",
          label: "Materials",
          type: "textarea",
          fullWidth: true,
        },
        {
          name: "lectures",
          label: "Lecture",
          type: "number",
          min: 0,
          defaultValue: 0,
          required: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            "Not Started",
            "In Progress",
            "Completed",
          ],
          defaultValue: "Not Started",
          required: true,
        },
        {
          name: "pdf",
          label: "PDF Lecture",
          type: "file",
          accept: ".pdf,application/pdf",
        },
        {
          name: "link",
          label: "Useful Link",
          type: "url",
        },
      ]}
    />
  );
}

function getStatusClass(status) {
  if (status === "Completed") {
    return "status-completed";
  }

  if (status === "In Progress") {
    return "status-progress";
  }

  return "status-not-started";
}

export default Subjects;