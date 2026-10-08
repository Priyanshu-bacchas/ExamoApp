import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import CrudPage from "../components/CrudPage";
import Modal from "../components/Modal";
import { getUser } from "../services/authService";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  setStudentBlocked,
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

// Credentials Reset: admin user ka naya password set karta hai
function ResetPasswordAction({ item, onDone }) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setNewPassword("");
    setError("");
    setOpen(true);
  }

  function closeModal() {
    if (!saving) setOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (newPassword.length < 6) {
      setError("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await resetStudentPassword(item.id, newPassword);

      setOpen(false);
      await onDone();
    } catch (err) {
      setError(err.message || "Password reset nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="edit-button"
        onClick={openModal}
        title="Reset password"
      >
        <KeyRound size={16} />
      </button>

      {open && (
        <Modal
          title={`Reset Password - ${item.name}`}
          onClose={closeModal}
        >
          <form className="crud-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-box full-width">{error}</div>
            )}

            <div className="form-group full-width">
              <label>
                New Password
                <span className="required">*</span>
              </label>

              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Reset Password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// Block / Unblock: blocked user login nahi kar sakta
function BlockAction({ item, onDone }) {
  const [busy, setBusy] = useState(false);

  const currentUser = getUser();

  // Admin khud ko block nahi kar sakta
  if (currentUser && currentUser.id === item.id) {
    return null;
  }

  async function handleClick() {
    const next = !item.isBlocked;

    const ok = window.confirm(
      next
        ? `${item.name} ko block karna hai? Wo login nahi kar payega.`
        : `${item.name} ko unblock karna hai?`
    );

    if (!ok) return;

    try {
      setBusy(true);

      await setStudentBlocked(item.id, next);

      await onDone();
    } catch (err) {
      window.alert(err.message || "Action nahi ho saka.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`adm-block-btn ${
        item.isBlocked ? "unblock" : "block"
      }`}
      onClick={handleClick}
      disabled={busy}
    >
      {busy ? "..." : item.isBlocked ? "Unblock" : "Block"}
    </button>
  );
}

function Students() {
  return (
    <CrudPage
      title="User & Role Management"
      emptyMessage="No users found."
      service={{
        get: getStudents,
        create: createStudent,
        update: updateStudent,
        delete: deleteStudent,
      }}
      extraActions={(item, reload) => (
        <>
          <BlockAction item={item} onDone={reload} />

          <ResetPasswordAction item={item} onDone={reload} />
        </>
      )}
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
          render: (item) => (
            <span
              className={`adm-pill ${
                item.role === "Admin"
                  ? "adm-pill-violet"
                  : "adm-pill-blue"
              }`}
            >
              {item.role}
            </span>
          ),
        },
        {
          key: "isBlocked",
          label: "Status",
          render: (item) => (
            <span
              className={`adm-pill ${
                item.isBlocked
                  ? "adm-pill-red"
                  : "adm-pill-green"
              }`}
            >
              {item.isBlocked ? "Blocked" : "Active"}
            </span>
          ),
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
