const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = () => localStorage.getItem("token");

const apiCall = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // For cookie-based auth if needed later
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API error");
  }

  return response.json();
};

export const authAPI = {
  register: (name, email, password) =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const activityAPI = {
  log: (action, meta = {}) =>
    apiCall("/activity/log-activity", {
      method: "POST",
      body: JSON.stringify({ action, meta }),
    }),
  getStats: () => apiCall("/activity/stats"),
  getSuspicious: () => apiCall("/activity/suspicious"),
  checkReplay: (action, clientTime) =>
    apiCall("/activity/replay-check", {
      method: "POST",
      body: JSON.stringify({ action, clientTime }),
    }),
};
