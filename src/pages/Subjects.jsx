import CrudPage from "../components/CrudPage";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  uploadSubjectPdf,
  getSubjectPdfUrl,
} from "../services/subjectService";

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
              <a
                className="table-link"
                href={getSubjectPdfUrl(item.pdf)}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
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