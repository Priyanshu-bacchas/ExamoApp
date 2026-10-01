
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:7183/api";

async function request(endpoint, options = {}) {
  const method = options.method || "GET";

  const config = {
    method,
    headers: {
      ...(options.headers || {}),
    },
  };

  // JSON body hone par hi Content-Type aur body add karo
  if (options.body !== undefined && options.body !== null) {
    config.headers["Content-Type"] = "application/json";
    config.body = options.body;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    config
  );

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
    } else if (data?.Message) {
      message = data.Message;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      const validationErrors = Object.values(data.errors)
        .flat()
        .join(" ");

      if (validationErrors) {
        message = validationErrors;
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
}

// ===============================
// GET
// ===============================
export const apiGet = (endpoint) =>
  request(endpoint, {
    method: "GET",
  });

// ===============================
// POST
// ===============================
export const apiPost = (endpoint, data) =>
  request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ===============================
// PUT
// ===============================
export const apiPut = (endpoint, data) =>
  request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ===============================
// DELETE
// ===============================
export const apiDelete = (endpoint) =>
  request(endpoint, {
    method: "DELETE",
  });

// ===============================
// DEFAULT API OBJECT
// ===============================
const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};

export default api;
