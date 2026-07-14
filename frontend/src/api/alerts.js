import apiClient from "./client";

export async function fetchAlerts({ page = 1, limit = 20 } = {}) {
  const res = await apiClient.get("/alerts", { params: { page, limit } });
  return res.data.data; // { alerts, pagination }
}
export async function markAllAlertsRead() {
  const res = await apiClient.patch("/alerts/read-all");
  return res.data;
}