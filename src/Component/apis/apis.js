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
export const initiateLogin = async ({ phone_number, company_email }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/login/initiate`, {  // Updated URL for login
      phone_number,
      company_email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Login initiation failed' };
  }
};

// ✅ User Login - verify OTP
export const verifyLoginOTP = async ({ phone_number, company_email, otp }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/login/verify`, {  // Updated URL for login
      phone_number,
      company_email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'OTP verification failed' };
  }
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
