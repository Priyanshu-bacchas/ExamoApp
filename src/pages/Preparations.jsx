import CrudPage from "../components/CrudPage";
import {
  getPreparations,
  createPreparation,
  updatePreparation,
  deletePreparation,
} from "../services/preparationService";

function Preparations() {
  return (
    <CrudPage
      title="Preparation"
      description="Track your preparation progress for each exam."
      emptyMessage="No preparation records found."
      service={{
        get: getPreparations,
        create: createPreparation,
        update: updatePreparation,
        delete: deletePreparation,
      }}
      columns={[
        {
          key: "examName",
          label: "Exam Name",
        },
        {
          key: "syllabus",
          label: "Syllabus",
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
      ]}
      fields={[
        {
          name: "examName",
          label: "Exam Name",
          required: true,
        },
        {
          name: "syllabus",
          label: "Syllabus",
          type: "textarea",
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
      ]}
    />
  );
}

function getStatusClass(status) {
  switch (status) {
    case "Completed":
      return "status-completed";

    case "In Progress":
      return "status-progress";

    default:
      return "status-not-started";
  }
}

export default Preparations;