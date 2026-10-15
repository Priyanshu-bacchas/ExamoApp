import { apiGet, apiDelete, authHeaders } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7183/api";

export const getDocuments = () => apiGet("/Documents");

export const deleteDocument = (id) =>
  apiDelete(`/Documents/${id}`);

// File kholne ka temporary (10 min) link
export const getDocumentUrl = async (id) => {
  const data = await apiGet(`/Documents/${id}/url`);

  return data?.url || "";
};

// Photo / PDF upload (multipart)
export const uploadDocument = async (name, file) => {
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