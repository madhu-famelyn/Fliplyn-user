import axios from 'axios';

export const getOrderDetailsByUserId = async (userId) => {
  const response = await axios.get(
    `https://admin-aged-field-2794.fly.dev/orders/user/details/${userId}`
  );
  return response.data;
};

