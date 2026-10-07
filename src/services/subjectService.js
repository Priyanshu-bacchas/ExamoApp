import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  authHeaders,
} from "./api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7183/api";

// Subject CRUD Operations
export const getSubjects = () => apiGet("/Subjects");
export const getSubjectById = (id) => apiGet(`/Subjects/${id}`);
export const createSubject = (data) => apiPost("/Subjects", data);
export const updateSubject = (id, data) => apiPut(`/Subjects/${id}`, data);
export const deleteSubject = (id) => apiDelete(`/Subjects/${id}`);

// Upload Subject PDF
export const uploadSubjectPdf = async (id, file) => {
  if (!id) throw new Error("Subject ID required.");
  if (!file) throw new Error("Please select a PDF file.");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/Subjects/${id}/pdf`, {
    method: "POST",
    headers: authHeaders(), // JWT token (Content-Type browser khud set karega)
    body: formData,
  });

  const text = await response.text();
  let data = text;

  try {
    data = JSON.parse(text);
  } catch {
    // Agar response JSON nahi hai toh plain text hi rehne dein
  }

  if (!response.ok) {
    const message =
      data?.message || data?.Message || data?.title || "PDF upload nahi ho saka.";
    throw new Error(message);
  }

  return data;
};

// Get Subject PDF URL
export const getSubjectPdfUrl = (pdfPath) => {
  if (!pdfPath) return "";

  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
    return pdfPath;
  }

  const backendUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  const path = pdfPath.startsWith("/") ? pdfPath : `/${pdfPath}`;

  return `${backendUrl}${path}`;
};