import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "./api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:7183/api";

export const getSubjects = () =>
  apiGet("/Subjects");

export const getSubjectById = (id) =>
  apiGet(`/Subjects/${id}`);

export const createSubject = (data) =>
  apiPost("/Subjects", data);

export const updateSubject = (id, data) =>
  apiPut(`/Subjects/${id}`, data);

export const deleteSubject = (id) =>
  apiDelete(`/Subjects/${id}`);

export const uploadSubjectPdf = async (
  id,
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/Subjects/${id}/pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    let message = "PDF upload nahi ho saka.";

    try {
      const errorData = await response.json();
      message =
        errorData?.message ||
        errorData?.Message ||
        message;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  return response.json();
};

export const getSubjectPdfUrl = (pdfPath) => {
  if (!pdfPath) {
    return "";
  }

  if (
    pdfPath.startsWith("http://") ||
    pdfPath.startsWith("https://")
  ) {
    return pdfPath;
  }

  const backendUrl = API_BASE_URL.replace(
    /\/api\/?$/,
    ""
  );

  const path = pdfPath.startsWith("/")
    ? pdfPath
    : `/${pdfPath}`;

  return `${backendUrl}${path}`;
};