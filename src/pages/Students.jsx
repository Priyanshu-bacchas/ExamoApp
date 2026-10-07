import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import CrudPage from "../components/CrudPage";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";

// Password cell: default me chhupa hua, eye icon se dikhta hai
function PasswordCell({ value }) {
  const [show, setShow] = useState(false);

  if (!value) {
    return <span style={{ color: "#94a3b8" }}>Not set</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          letterSpacing: show ? "0" : "2px",
        }}
      >
        {show ? value : "••••••••"}
      </span>

      <button
        type="button"
        onClick={() => setShow(!show)}
        title={show ? "Hide password" : "Show password"}
        style={{
          display: "flex",
          padding: 2,
          border: "none",
          background: "none",
          color: "#64748b",
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </span>
  );
}

function Students() {
  return (
    <CrudPage
      title="Student Records"
      description="Registered students and admins."
      emptyMessage="No students found."
      service={{
        get: getStudents,
        create: createStudent,
        update: updateStudent,
        delete: deleteStudent,
      }}
      columns={[
        {
          key: "name",
          label: "Name",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "mobileNumber",
          label: "Mobile",
        },
        {
          key: "password",
          label: "Password",
          render: (item) => <PasswordCell value={item.password} />,
        },
        {
          key: "role",
          label: "Role",
        },
        {
          key: "createdAt",
          label: "Joined",
          type: "date",
        },
      ]}
      fields={[
        {
          name: "name",
          label: "Name",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
        },
        {
          name: "mobileNumber",
          label: "Mobile Number",
          type: "tel",
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: ["Student", "Admin"],
          defaultValue: "Student",
          required: true,
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Min 6 characters",
          autoComplete: "new-password",
        },
      ]}
    />
  );
}

export default Students;
