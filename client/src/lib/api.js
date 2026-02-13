const API_BASE = "https://product-hackathon-production.up.railway.app/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Ensure endpoint starts with / (e.g. "/groups")
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}