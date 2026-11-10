import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  FileText,
  BookOpen,
} from "lucide-react";

import Modal from "../components/Modal";
import {
  getEbooks,
  getEbookUrl,
  uploadEbook,
  updateEbook,
  setEbookAccess,
  setEbookPublished,
  deleteEbook,
} from "../services/ebookService";

import "../components/CrudToolbar.css";
import "./Ebooks.css";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (backend jaisa)

const EMPTY_FORM = {
  title: "",
  description: "",
  access: "Free",
  publishStatus: "Published",
  file: null,
};

function formatSize(bytes) {
  const size = Number(bytes) || 0;
  if (size <= 0) return "-";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// Content Manager > Ebook tab
function AdminEbooks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const data = await getEbooks({ includeDrafts: true });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load ebooks.");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      access: item.access || "Free",
      publishStatus: item.publishStatus || "Published",
      file: null,
    });
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
  }

  function handleChange(event) {
    const { name, value, files } = event.target;
    if (name === "file") {
      const file = files?.[0] || null;
      if (file && file.size > MAX_BYTES) {
        setFormError("PDF size must be 50 MB or less.");
        event.target.value = "";
        return;
      }
      if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setFormError("Please select a PDF file.");
        event.target.value = "";
        return;
      }
      setForm((prev) => ({ ...prev, file }));
      setFormError("");
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Please enter an ebook title.");
      return;
    }
    if (!editingId && !form.file) {
      setFormError("Please select a PDF file.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateEbook(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
          access: form.access,
          publishStatus: form.publishStatus,
        });
      } else {
        await uploadEbook({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
        });
      }
      setShowModal(false);
      setNotice(editingId ? "Ebook updated successfully." : "Ebook uploaded successfully.");
      await loadData();
    } catch (err) {
      setFormError(err.message || "Unable to save ebook.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAccess(item) {
    try {
      await setEbookAccess(item.id, item.access === "Paid" ? "Free" : "Paid");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update ebook access.");
    }
  }

  async function handleTogglePublish(item) {
    try {
      await setEbookPublished(item.id, item.publishStatus !== "Published");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update ebook visibility.");
    }
  }

  async function handleView(item) {
    try {
      const url = await getEbookUrl(item.id);
      if (!url) throw new Error("PDF link not found.");
      window.open(url, "_blank", "noopener");
    } catch (err) {
      setError(err.message || "Unable to open PDF.");
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await deleteEbook(item.id);
      setNotice("Ebook deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete ebook.");
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesQuery = !query || `${item.title || ""} ${item.description || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesAccess = accessFilter === "All" || item.access === accessFilter;
    const matchesVisibility = visibilityFilter === "All" ||
      (visibilityFilter === "Published" ? item.publishStatus === "Published" : item.publishStatus !== "Published");
    return matchesQuery && matchesAccess && matchesVisibility;
  });

  return (
    <div className="admin-ebooks">
      <div className="crud-toolbar">
        <div className="crud-toolbar-left">
          <div className="search-box">
            <Search size={16} />
            <input value={queryInput} onChange={(e) => setQueryInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQuery(queryInput)} placeholder="Search ebooks..." />
          </div>
          <select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)}>
            <option value="All">All access</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
            <option value="All">All visibility</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <div className="crud-toolbar-right">
          <button type="button" className="secondary-button" onClick={loadData} disabled={loading}><RefreshCw size={15} /> Refresh</button>
          <button type="button" className="primary-button" onClick={openAdd}><Plus size={16} /> Add Ebook</button>
        </div>
      </div>

      {notice && <div className="success-box">{notice}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="data-card">
      {loading ? <div className="loading-state">Loading ebooks...</div> : filteredItems.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><BookOpen size={24} /></div><h3>No ebooks found</h3><p>Upload a PDF to get started.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Ebook</th><th>Size</th><th>Access</th><th>Visibility</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="eb-name"><FileText size={18} /><div><div>{item.title}</div>{item.description && <div className="eb-desc">{item.description}</div>}</div></div>
                  </td>
                  <td>{formatSize(item.sizeBytes)}</td>
                  <td><button type="button" className="edit-button" onClick={() => handleToggleAccess(item)} title={item.access === "Paid" ? "Paid - click to make Free" : "Free - click to make Paid"}>{item.access === "Paid" ? <Lock size={16} /> : <Unlock size={16} />}{item.access || "Free"}</button></td>
                  <td><button type="button" className="edit-button" onClick={() => handleTogglePublish(item)} title={item.publishStatus === "Published" ? "Move to Draft (hide)" : "Publish (show to students)"}>{item.publishStatus === "Published" ? <Eye size={16} /> : <EyeOff size={16} />}{item.publishStatus || "Draft"}</button></td>
                  <td>
                    <div className="eb-actions">
                      <button type="button" className="eb-btn ghost" onClick={() => handleView(item)}><Eye size={14} /> Open PDF</button>
                      <button type="button" className="edit-button" title="Edit" onClick={() => openEdit(item)}><Pencil size={16} /></button>
                      <button type="button" className="delete-button" title="Delete" onClick={() => handleDelete(item)}><Trash2 size={16} /></button>
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
        <Modal title={editingId ? "Edit Ebook" : "Add Ebook"} onClose={closeModal}>
          <form className="crud-form" onSubmit={handleSubmit}>
            {formError && <div className="error-box">{formError}</div>}
            <div className="form-group full-width">
              <label>Title<span className="required">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Ebook title" maxLength={200} required />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description (optional)" maxLength={1000} rows={3} />
            </div>
            <div className="form-group">
              <label>Type<span className="required">*</span></label>
              <select name="access" value={form.access} onChange={handleChange} required><option value="Free">Free</option><option value="Paid">Paid</option></select>
            </div>
            <div className="form-group">
              <label>Visibility<span className="required">*</span></label>
              <select name="publishStatus" value={form.publishStatus} onChange={handleChange} required><option value="Published">Published</option><option value="Draft">Draft</option></select>
            </div>
            {!editingId && (
              <div className="form-group full-width">
                <label>PDF file<span className="required">*</span></label>
                <input className="eb-file-input" type="file" name="file" accept="application/pdf,.pdf" onChange={handleChange} required />
                <div className="eb-hint">Only PDF, maximum 50 MB. To change the file later, delete the ebook and upload it again.</div>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>Cancel</button>
              <button type="submit" className="primary-button" disabled={saving}>{saving ? (editingId ? "Saving..." : "Uploading...") : (editingId ? "Update" : "Upload")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminEbooks;