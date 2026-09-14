const BASE_URL = import.meta.env.VITE_API_URL || "https://cloud-kitchen-gg2u.onrender.com/api";

async function request(path, { method = "GET", body, adminPassword } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (adminPassword) headers["x-admin-password"] = adminPassword;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getMenu: (includeUnavailable = false) =>
    request(`/recipes${includeUnavailable ? "?all=true" : ""}`),

  placeOrder: (order) => request("/orders", { method: "POST", body: order }),

  // --- Admin (requires password) ---
  getOrders: (adminPassword) => request("/orders", { adminPassword }),
  updateOrderStatus: (id, status, adminPassword) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: { status }, adminPassword }),

  addRecipe: (recipe, adminPassword) =>
    request("/recipes", { method: "POST", body: recipe, adminPassword }),
  updateRecipe: (id, changes, adminPassword) =>
    request(`/recipes/${id}`, { method: "PUT", body: changes, adminPassword }),
  deleteRecipe: (id, adminPassword) =>
    request(`/recipes/${id}`, { method: "DELETE", adminPassword }),
};
