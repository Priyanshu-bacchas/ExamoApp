import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Modal from "./Modal";

function CrudPage({
  title,
  description,
  columns,
  fields,
  service,
  emptyMessage,
  extraActions,
}) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await service.get();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setItems(data);
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Data load nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    const initialData = {};

    fields.forEach((field) => {
      initialData[field.name] =
        field.defaultValue ?? "";
    });

    setFormData(initialData);
    setEditingId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(item) {
    const data = {};

    fields.forEach((field) => {
      if (field.type === "file") {
        data[field.name] = "";
      } else {
        data[field.name] =
          item[field.name] ?? "";
      }
    });

    setFormData(data);
    setEditingId(item.id);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (!saving) {
      setShowModal(false);
      setEditingId(null);
    }
  }

  function handleChange(event) {
    const { name, value, files } =
      event.target;

    const field = fields.find(
      (item) => item.name === name
    );

    if (field?.type === "file") {
      setFormData((previous) => ({
        ...previous,
        [name]: files?.[0] || null,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = buildPayload(
        formData,
        fields
      );

      let savedItem;

      if (editingId) {
        savedItem = await service.update(
          editingId,
          payload
        );
      } else {
        savedItem = await service.create(
          payload
        );
      }

      const savedId =
        editingId ||
        savedItem?.id ||
        savedItem?.data?.id;

      const fileField = fields.find(
        (field) => field.type === "file"
      );

      const selectedFile =
        fileField
          ? formData[fileField.name]
          : null;

      if (
        selectedFile &&
        service.uploadFile &&
        savedId
      ) {
        await service.uploadFile(
          savedId,
          selectedFile
        );
      }

      setShowModal(false);
      setEditingId(null);

      await loadData();
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Save nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Kya aap is record ko delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await service.delete(id);

      await loadData();
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Delete nahi ho saka."
      );
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-button"
            onClick={openAdd}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Plus size={24} />
            </div>

            <h3>
              {emptyMessage ||
                "No records found"}
            </h3>

            <p>
              Add your first record using the
              button above.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>
                      {column.label}
                    </th>
                  ))}

                  <th className="actions-column">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render
                          ? column.render(item)
                          : formatValue(
                              item[column.key],
                              column.type
                            )}
                      </td>
                    ))}

                    <td>
                      <div className="row-actions">
                        {extraActions &&
                          extraActions(item, loadData)}

                        <button
                          className="edit-button"
                          onClick={() =>
                            openEdit(item)
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={
            editingId
              ? `Edit ${title}`
              : `Add ${title}`
          }
          onClose={closeModal}
        >
          <form
            className="crud-form"
            onSubmit={handleSubmit}
          >
            {fields.map((field) => (
              <div
                className={`form-group ${
                  field.fullWidth
                    ? "full-width"
                    : ""
                }`}
                key={field.name}
              >
                <label>
                  {field.label}

                  {field.required && (
                    <span className="required">
                      *
                    </span>
                  )}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={
                      formData[field.name] ??
                      ""
                    }
                    onChange={handleChange}
                    required={
                      field.required
                    }
                  >
                    <option value="">
                      Select{" "}
                      {field.label}
                    </option>

                    {field.options.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                ) : field.type ===
                  "textarea" ? (
                  <textarea
                    name={field.name}
                    value={
                      formData[field.name] ??
                      ""
                    }
                    onChange={handleChange}
                    placeholder={
                      field.placeholder ||
                      ""
                    }
                    required={
                      field.required
                    }
                    rows={4}
                  />
                ) : field.type ===
                  "file" ? (
                  <input
                    type="file"
                    name={field.name}
                    onChange={handleChange}
                    accept={
                      field.accept ||
                      undefined
                    }
                  />
                ) : (
                  <input
                    type={
                      field.type || "text"
                    }
                    name={field.name}
                    value={
                      formData[field.name] ??
                      ""
                    }
                    onChange={handleChange}
                    placeholder={
                      field.placeholder ||
                      ""
                    }
                    required={
                      field.required
                    }
                    min={field.min}
                  />
                )}
              </div>
            ))}

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
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function buildPayload(data, fields) {
  const payload = {};

  fields.forEach((field) => {
    if (field.type === "file") {
      return;
    }

    let value = data[field.name];

    if (
      field.type === "number" &&
      value !== ""
    ) {
      value = Number(value);
    }

    payload[field.name] = value;
  });

  return payload;
}

function formatValue(value, type) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (type === "date") {
    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return value;
}

export default CrudPage;