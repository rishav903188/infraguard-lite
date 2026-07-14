import apiClient from "./client";

export async function fetchMonitors({ page = 1, limit = 10 } = {}) {
  const res = await apiClient.get("/monitors", { params: { page, limit } });
  return res.data.data; 
}

export async function fetchMonitorById(id) {
  const res = await apiClient.get(`/monitors/${id}`);
  return res.data.data.monitor;
}

export async function createMonitor(payload) {
  const res = await apiClient.post("/monitors", payload);
  return res.data.data.monitor;
}

export async function updateMonitor(id, payload) {
  const res = await apiClient.put(`/monitors/${id}`, payload);
  return res.data.data.monitor;
}

export async function deleteMonitor(id) {
  await apiClient.delete(`/monitors/${id}`);
  return id;
}

export async function toggleMonitor(id, isActive) {
  const res = await apiClient.patch(`/monitors/${id}/toggle`, { isActive });
  return res.data.data.monitor;
}