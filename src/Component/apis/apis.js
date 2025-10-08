// src/api/user.js
import axios from 'axios';

// Corrected BASE_URL to avoid '/user'
const BASE_URL = 'https://fliplyn.onrender.com';

// ✅ User Signup
export const signupUser = (userData) => {
  return axios.post(`${BASE_URL}/signup`, userData);  // Correctly points to /signup
};

export const sendOtp = (data) => {
  return axios.post(`${BASE_URL}/send-otp`, data);  // Correctly points to /send-otp
};

export const verifyOtp = (data) => {
  return axios.post(`${BASE_URL}/verify-otp`, data);  // Correctly points to /verify-otp
};


// ✅ User Login - initiate OTP
export const initiateLogin = async ({ company_email, password }) => {
  const response = await axios.post(
    'https://fliplyn.onrender.com/user/login',
    { company_email, password }, // ✅ JSON body
    {
      headers: {
        'Content-Type': 'application/json', // ✅ Required for FastAPI to parse correctly
      },
    }
  );

  return response.data;
};

// ✅ User Login - verify OTP

export const verifyLoginOTP = (data) => {
  return axios
    .post(`${BASE_URL}/user/login/verify`, data)
    .then((res) => res.data)
    .catch((err) => {
      throw err.response?.data || { detail: 'Unknown error' };
    });
};

export const initiateLoginOTP = (data) => {
  return axios
    .post(`${BASE_URL}/user/login/initiate`, data)
    .then((res) => res.data)
    .catch((err) => {
      throw err.response?.data || { detail: 'Unknown error' };
    });
};


// ✅ Admin Login (OAuth2 password grant)
export const loginAdmin = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email); // FastAPI uses "username" even if it's email
    formData.append('password', password);

    const response = await axios.post(`${BASE_URL}/admin/auth/login`, formData, {  // Corrected URL for admin login
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data; // { access_token, token_type, user: { id, name, email } }
  } catch (error) {
    throw error.response?.data || { detail: 'Admin login failed' };
  }
};
