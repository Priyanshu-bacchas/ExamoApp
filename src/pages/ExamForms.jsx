import CrudPage from "../components/CrudPage";
import {
  getExamForms,
  createExamForm,
  updateExamForm,
  deleteExamForm,
} from "../services/examFormService";

function ExamForms() {
  return (
    <CrudPage
      title="Exam Forms"
      description="Manage examination application forms and deadlines."
      emptyMessage="No exam forms found."
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