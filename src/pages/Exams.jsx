
import CrudPage from "../components/CrudPage";

import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
} from "../services/examService";

function Exams() {
  return (
    <CrudPage
      title="Exams"
      description="Manage upcoming and scheduled examinations."
      emptyMessage="No exams found."
      service={{
        get: getExams,
        create: createExam,
        update: updateExam,
        delete: deleteExam,
      }}
      columns={[
        {
          key: "examName",
          label: "Exam Name",
        },
        {
          key: "examDate",
          label: "Exam Date",
          type: "date",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => {
            const status = item.status || "Coming Soon";

            let backgroundColor = "#fff3cd";
            let color = "#856404";

            if (status === "Done") {
              backgroundColor = "#d1fae5";
              color = "#047857";
            } else if (status === "In Progress") {
              backgroundColor = "#dbeafe";
              color = "#2563eb";
            }

            return (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  backgroundColor,
                  color,
                  fontSize: "12px",
                  fontWeight: "500",
                  lineHeight: "1",
                  whiteSpace: "nowrap",
                }}
              >
                {status}
              </span>
            );
          },
        },
      ]}
      fields={[
        {
          name: "examName",
          label: "Exam Name",
          required: true,
        },
        {
          name: "examDate",
          label: "Exam Date",
          type: "date",
          required: false,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "Coming Soon",
          options: ["Done", "Coming Soon"],
        },
      ]}
    />
  );
}

export default Exams;

