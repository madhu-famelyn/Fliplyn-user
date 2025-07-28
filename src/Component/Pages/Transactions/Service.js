// src/pages/transactionsService.js
import axios from 'axios';

export const getOrderDetailsByUserId = async (userId) => {
  const response = await axios.get(
    `http://fliplyn.onrender.com/orders/user/details/${userId}`
  );
  return response.data;
};
