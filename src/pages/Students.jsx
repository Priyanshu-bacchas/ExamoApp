import CrudPage from "../components/CrudPage";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";

function Students() {
  return (
    <CrudPage
      title="Student Records"
      description="Manage student information."
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
          key: "course",
          label: "Course",
        },
        {
          key: "age",
          label: "Age",
        },
        {
          key: "city",
          label: "City",
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
          name: "course",
          label: "Course",
        },
        {
          name: "age",
          label: "Age",
          type: "number",
          min: 1,
        },
        {
          name: "city",
          label: "City",
        },
      ]}
    />
  );
}

export default Students;