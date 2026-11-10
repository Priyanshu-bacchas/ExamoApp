import { apiGet, apiPut, apiDelete, authHeaders } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7183/api";

export const getEbooks = ({ access, includeDrafts = false } = {}) => {
  const params = new URLSearchParams();

  if (access) params.set("access", access);
  if (includeDrafts) params.set("includeDrafts", "true");

  const query = params.toString();

  return apiGet(`/Ebooks${query ? `?${query}` : ""}`);
};

export const getEbookUrl = async (id) => {
  const data = await apiGet(`/Ebooks/${id}/url`);
  return data?.url || "";
};

export const getEbookDownloadUrl = async (id) => {
  const data = await apiGet(`/Ebooks/${id}/download-url`);
  return data?.url || "";
};

export const uploadEbook = async ({
  title,
  description,
  access,
  publishStatus,
  file,
}) => {
  if (!file) throw new Error("Please select a PDF file.");

  const formData = new FormData();
  formData.append("title", title || "");
  formData.append("description", description || "");
  formData.append("access", access || "Free");
  formData.append("publishStatus", publishStatus || "Published");
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/Ebooks`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const text = await response.text();
  let data = text;

  try {
    data = JSON.parse(text);
  } catch {
    // Plain-text response
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      data?.title ||
      "Upload failed.";
    throw new Error(message);
  }

  return data;
};

export const updateEbook = (id, data) => apiPut(`/Ebooks/${id}`, data);

export const setEbookAccess = (id, access) =>
  apiPut(`/Ebooks/${id}/access`, { access });

export const setEbookPublished = (id, published) =>
  apiPut(`/Ebooks/${id}/publish`, { published });

export const deleteEbook = (id) => apiDelete(`/Ebooks/${id}`);
