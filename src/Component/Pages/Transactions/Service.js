import axios from 'axios';

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

const API_BASE = isLocal
  ? `http://${window.location.hostname}:8000`
  : "https://admin-aged-field-2794.fly.dev";

export const getOrderDetailsByUserId = async (userId) => {
  const response = await axios.get(
    `${API_BASE}/orders/user/details/${userId}`
  );
  return response.data;
};

