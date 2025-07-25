// src/pages/transactionsService.js
import axios from 'axios';

export const getOrderDetailsByUserId = async (userId) => {
  const response = await axios.get(
    `http://127.0.0.1:8000/orders/user/details/${userId}`
  );
  return response.data;
};
