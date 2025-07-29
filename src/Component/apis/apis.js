// src/api/user.js
import axios from 'axios';


const BASE_URL = 'https://fliplyn-api.onrender.com';


export const signupUser = (userData) => {
  return axios.post(`${BASE_URL}/signup`, userData);
};

export const sendOtp = (data) => {
  return axios.post(`${BASE_URL}/send-otp`, data);
};

export const verifyOtp = (data) => {
  return axios.post(`${BASE_URL}/verify-otp`, data);
};


export const initiateLogin = async ({ phone_number, company_email }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/user/login/initiate`, {
      phone_number,
      company_email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Login initiation failed' };
  }
};

export const verifyLoginOTP = async ({ phone_number, company_email, otp }) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/login/verify`, {
      phone_number,
      company_email,
      otp,
    });
    return response.data; // contains access_token and user object
  } catch (error) {
    throw error.response?.data || { detail: 'OTP verification failed' };
  }
};