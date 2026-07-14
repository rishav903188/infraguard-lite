import apiClient from "./client";

export async function fetchMonitorAnalytics(monitorId) {
  const res = await apiClient.get(`/analytics/${monitorId}`);
  return res.data.data;
}

export async function fetchGlobalAnalytics() {
  const res = await apiClient.get("/analytics");
  return res.data.data;
}