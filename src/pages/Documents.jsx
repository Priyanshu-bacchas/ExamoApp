import { useEffect, useState } from "react";
import {
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import Modal from "../components/Modal";
import { apiGet, apiDelete, authHeaders } from "../services/api";

// ---- Documents API (is file me hi, alag service file ki zaroorat nahi) ----

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7183/api";

const getDocuments = () => apiGet("/Documents");

const deleteDocument = (id) => apiDelete(`/Documents/${id}`);

// File kholne ka temporary (10 min) link
const getDocumentUrl = async (id) => {
  const data = await apiGet(`/Documents/${id}/url`);

  return data?.url || "";
};

// Photo / PDF upload (multipart)
const uploadDocument = async (name, file) => {
  if (!file) throw new Error("Please select a file.");

  const formData = new FormData();

  formData.append("name", name || "");
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/Documents`, {
    method: "POST",
    headers: authHeaders(), // Content-Type browser khud set karega
    body: formData,
  });

  const text = await response.text();

  let data = text;

  try {
    data = JSON.parse(text);
  } catch {
    // plain text response
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      data?.title ||
      "Upload nahi ho saka.";

    throw new Error(message);
  }

  return data;
};

const MAX_MB = 10;

function Documents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Documents load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setName("");
    setFile(null);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (!uploading) setModalOpen(false);
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;

    setFormError("");

    if (selected && selected.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setFormError(`File ${MAX_MB} MB se chhoti honi chahiye.`);
      return;
    }

    setFile(selected);

    // Naam khali ho to file ka naam suggest kar do
    if (selected && !name.trim()) {
      setName(selected.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setFormError("Photo ya PDF select karein.");
      return;
    }

    try {
      setUploading(true);
      setFormError("");

      await uploadDocument(name.trim(), file);

      setModalOpen(false);

      await loadData();
    } catch (err) {
      setFormError(err.message || "Upload nahi ho saka.");
    } finally {
      setUploading(false);
    }
  }

  async function handleView(item) {
    // Popup blocker se bachne ke liye tab pehle hi khol lete hain
    const tab = window.open("", "_blank");

    try {
      setBusyId(item.id);

      const url = await getDocumentUrl(item.id);

      if (!url) throw new Error("File ka link nahi mila.");

      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      if (tab) tab.close();

      window.alert(err.message || "File open nahi ho saki.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`"${item.name}" delete karna hai?`)) return;

    try {
      setBusyId(item.id);

      await deleteDocument(item.id);

      await loadData();
    } catch (err) {
      window.alert(err.message || "Delete nahi ho saka.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>

          <p>Keep your photos and PDF documents safe in one place.</p>
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

          <button className="primary-button" onClick={openModal}>
            <Plus size={18} />
            Upload
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="data-card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No documents yet</h3>

            <p>Upload a photo or PDF to see it here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {item.kind === "Photo" ? (
                          <ImageIcon size={18} color="#2563eb" />
                        ) : (
                          <FileText size={18} color="#dc2626" />
                        )}

                        <span>
                          <strong>{item.name}</strong>

                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            {item.fileName}
                          </div>
                        </span>
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          item.kind === "Photo"
                            ? "status-progress"
                            : "status-pending"
                        }`}
                      >
                        {item.kind}
                      </span>
                    </td>

                    <td>{formatSize(item.sizeBytes)}</td>

                    <td>{formatDate(item.createdAt)}</td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-button"
                          title="View"
                          onClick={() => handleView(item)}
                          disabled={busyId === item.id}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="delete-button"
                          title="Delete"
                          onClick={() => handleDelete(item)}
                          disabled={busyId === item.id}
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

      {modalOpen && (
        <Modal title="Upload Document" onClose={closeModal}>
          <form className="crud-form" onSubmit={handleUpload}>
            {formError && (
              <div className="error-box full-width">{formError}</div>
            )}

            <div className="form-group full-width">
              <label>Document Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Passport size photo, Marksheet"
                maxLength={150}
              />
            </div>

            <div className="form-group full-width">
              <label>
                Photo or PDF
                <span className="required">*</span>
              </label>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />

              <small style={{ color: "#64748b" }}>
                JPG, PNG, WEBP ya PDF, max {MAX_MB} MB.
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "-";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default Documents;
