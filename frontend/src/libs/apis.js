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

  // check if token is avaliable in local storage
  const tokenAvailable = localStorage.getItem("accessToken");

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  } else if (tokenAvailable) {
    finalHeaders["Authorization"] = `Bearer ${tokenAvailable}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.error.message || "Something went wrong",
        status: response.status,
      };
    }

    return responseData;
  } catch (err) {
    return {
      success: false,
      message: err.message || "Something went wrong",
    };
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
