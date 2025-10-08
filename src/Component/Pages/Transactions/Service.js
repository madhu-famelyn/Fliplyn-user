import axios from 'axios';

export const getOrderDetailsByUserId = async (userId) => {
  const response = await axios.get(
    `https://fliplyn.onrender.com/orders/user/details/${userId}`
  );
  return response.data;
};

