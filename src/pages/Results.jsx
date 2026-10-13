import CrudPage from "../components/CrudPage";
import {
  getResults,
  createResult,
  updateResult,
  deleteResult,
} from "../services/resultService";

function Results() {
  return (
    <CrudPage
      title="Results"
      description="Track the result of each exam you applied for."
      emptyMessage="No results found. Add an exam form and it appears here."
      service={{
        get: getResults,
        create: createResult,
        update: updateResult,
        delete: deleteResult,
      }}
      columns={[
        {
          key: "examName",
          label: "Exam Name",
        },
        {
          key: "result",
          label: "Result",
          render: (item) => getResultBadge(item.result),
        },
      ]}
      fields={[
        {
          name: "examName",
          label: "Exam Name",
          required: true,
        },
        {
          name: "result",
          label: "Result",
          type: "select",
          options: ["Awaited", "Qualified", "Not Qualified"],
          defaultValue: "Awaited",
          required: true,
        },
      ]}
    />
  );
}

function getResultBadge(result) {
  if (result === "Qualified") {
    return (
      <span className="status-badge status-completed">
        {result}
      </span>
    );
  }

  if (result === "Not Qualified") {
    return (
      <span
        className="status-badge"
        style={{ background: "#fef2f2", color: "#b91c1c" }}
      >
        {result}
      </span>
    );
  }

  return (
    <span className="status-badge status-pending">
      {result || "Awaited"}
    </span>
  );
}

export default Results;
