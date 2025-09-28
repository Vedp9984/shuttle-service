import api from "./api";

export const loginUser = async (username, password, userType) => {
  const res = await api.post("/auth/login", { username, password, userType });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const getRoutes = async () => {
  const res = await api.get("/routes");
  return res.data;
};

export const getRouteDetails = async (routeId) => {
  const res = await api.get(`/routes/${routeId}`);
  return res.data;
};

export const bookSeat = async (bookingData) => {
  const res = await api.post("/bookings", bookingData);
  return res.data;
};

export const getUserBookings = async () => {
  const res = await api.get("/bookings/user");
  return res.data;
};
