import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import Modal from "./Modal";

import "./CrudToolbar.css";

function CrudPage({
  title,
  description,
  columns,
  fields,
  service,
  emptyMessage,
  extraActions,
  statusOnlyEdit = false,
  hideAdd = false,
  // Optional: search box (searchKeys), dropdown filter (filter) aur
  // tick box + bulk buttons (bulkActions). Na do to page pehle jaisa chalta hai.
  searchKeys,
  searchPlaceholder = "Search by name...",
  filter,
  bulkActions,
}) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [selected, setSelected] = useState([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [notice, setNotice] = useState("");

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

      // Jo records ab nahi rahe unka tick hata do
      setSelected((previous) =>
        previous.filter((id) =>
          data.some((item) => item.id === id)
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to load data."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---- Search / filter ----
  const searchText = query.trim().toLowerCase();

  const visibleItems = items.filter((item) => {
    if (
      filter &&
      filterValue !== "All" &&
      item[filter.field] !== filterValue
    ) {
      return false;
    }

    if (searchText && searchKeys?.length) {
      const haystack = searchKeys
        .map((key) => String(item[key] ?? ""))
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchText);
    }

    return true;
  });

  const showToolbar = Boolean(searchKeys?.length || filter);

  // ---- Bulk select ----
  const allVisibleSelected =
    visibleItems.length > 0 &&
    visibleItems.every((item) => selected.includes(item.id));

  function toggleOne(id) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id]
    );
  }

  function toggleAllVisible() {
    setSelected((previous) => {
      if (allVisibleSelected) {
        return previous.filter(
          (id) => !visibleItems.some((item) => item.id === id)
        );
      }

      const merged = new Set(previous);

      visibleItems.forEach((item) => merged.add(item.id));

      return [...merged];
    });
  }

  async function handleBulk(action) {
    const chosen = items.filter((item) =>
      selected.includes(item.id)
    );

    if (chosen.length === 0) return;

    try {
      setBulkRunning(true);
      setError("");
      setNotice("");

      // run() false de to user ne Cancel kiya - kuch nahi badalna
      const message = await action.run(chosen);

      if (message === false) return;

      if (message) setNotice(message);

      setSelected([]);

      await loadData();
    } catch (error) {
      console.error(error);
      setError(error.message || "Bulk action failed.");
    } finally {
      setBulkRunning(false);
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

  // statusOnlyEdit: naya record banate waqt sab fields chalte hain,
  // par edit karte waqt sirf editableOnEdit wali field (status / result) chalti hai
  function isFieldLocked(field) {
    return Boolean(statusOnlyEdit && editingId && !field.editableOnEdit);
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
        error.message || "Failed to save."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await service.delete(id);

      await loadData();
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Failed to delete."
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

          {!hideAdd && (
            <button
              className="primary-button"
              onClick={openAdd}
            >
              <Plus size={18} />
              Add
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {notice && (
        <div className="crud-notice">{notice}</div>
      )}

      {showToolbar && (
        <form
          className="adm-filters"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(queryInput);
          }}
        >
          {searchKeys?.length > 0 && (
            <div className="adm-field grow">
              <label>Search</label>

              <input
                type="text"
                value={queryInput}
                onChange={(event) => {
                  setQueryInput(event.target.value);

                  // Box khaali karte hi poori list wapas
                  if (event.target.value === "") setQuery("");
                }}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          {filter && (
            <div className="adm-field">
              <label>{filter.label}</label>

              <select
                value={filterValue}
                onChange={(event) =>
                  setFilterValue(event.target.value)
                }
              >
                <option value="All">
                  {filter.allLabel || `All ${filter.label}`}
                </option>

                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="primary-button">
            Search
          </button>

          <span className="adm-count">
            {visibleItems.length} record
            {visibleItems.length === 1 ? "" : "s"}
          </span>
        </form>
      )}

      {bulkActions && selected.length > 0 && (
        <div className="crud-bulkbar">
          <strong>{selected.length} selected</strong>

          {bulkActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`crud-bulk-btn ${
                action.danger ? "danger" : ""
              }`}
              onClick={() => handleBulk(action)}
              disabled={bulkRunning}
            >
              {action.label}
            </button>
          ))}

          <button
            type="button"
            className="crud-bulk-clear"
            onClick={() => setSelected([])}
            disabled={bulkRunning}
          >
            Clear
          </button>
        </div>
      )}

      <div className="data-card">
        {loading ? (
          <div className="loading-state">
            Loading...
          </div>
        ) : items.length > 0 && visibleItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={24} />
            </div>

            <h3>No entries match your search.</h3>

            <p>Try a different name or filter.</p>
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

            {!hideAdd && (
              <p>
                Add your first record using the
                button above.
              </p>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {bulkActions && (
                    <th className="select-column">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Select all"
                      />
                    </th>
                  )}

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
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    {bulkActions && (
                      <td className="select-column">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleOne(item.id)}
                          aria-label="Select row"
                        />
                      </td>
                    )}

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
                    disabled={isFieldLocked(field)}
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
                    disabled={isFieldLocked(field)}
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
                    disabled={isFieldLocked(field)}
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