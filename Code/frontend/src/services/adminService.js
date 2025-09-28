import api from "./api";

// Routes
export const addRoute = async (routeData) => {
  const res = await api.post("/admin/routes", routeData);
  return res.data;
};

export const updateRoute = async (routeId, routeData) => {
  const res = await api.put(`/admin/routes/${routeId}`, routeData);
  return res.data;
};

export const deleteRoute = async (routeId) => {
  const res = await api.delete(`/admin/routes/${routeId}`);
  return res.data;
};

// Drivers
export const assignDriver = async (driverId, busId, routeId) => {
  const res = await api.post("/admin/assign", { driverId, busId, routeId });
  return res.data;
};

// Payments
export const getAllPayments = async () => {
  const res = await api.get("/admin/payments");
  return res.data;
};

// Analytics
export const getAnalytics = async () => {
  const res = await api.get("/admin/analytics");
  return res.data;
};
