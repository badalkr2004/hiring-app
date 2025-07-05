import { API_BASE_URL } from "../config/api";

function buildUrl(endpoint, params) {
  const url = new URL(API_BASE_URL + endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
  }
  return url.toString();
}

async function apiRequest(endpoint, options = {}) {
  const { method = "GET", headers = {}, body, params, token } = options;

  const url = buildUrl(endpoint, params);

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "PUT", body }),

  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),

  patch: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "PATCH", body }),
};
