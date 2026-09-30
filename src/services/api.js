const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7183/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let message = `API Error: ${response.status}`;

    if (data?.message) {
      message = data.message;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      const validationErrors = Object.values(data.errors)
        .flat()
        .join(" ");

      if (validationErrors) {
        message = validationErrors;
      }
    }

    throw new Error(message);
  }

  return data;
}

export const apiGet = (endpoint) =>
  request(endpoint, {
    method: "GET",
  });

export const apiPost = (endpoint, data) =>
  request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiPut = (endpoint, data) =>
  request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiDelete = (endpoint) =>
  request(endpoint, {
    method: "DELETE",
  });

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};