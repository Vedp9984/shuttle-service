import api from "./api";

// View assigned routes/schedules
export const getDriverSchedules = async () => {
  const res = await api.get("/driver/schedules");
  return res.data;
};

// Update trip status
export const updateTripStatus = async (scheduleId, status) => {
  const res = await api.put(`/driver/schedules/${scheduleId}`, { status });
  return res.data;
};

// Send delay/incident notifications
export const sendNotification = async (message) => {
  const res = await api.post("/driver/notifications", { message });
  return res.data;
};
