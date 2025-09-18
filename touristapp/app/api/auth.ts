import axios from "axios";

const API_BASE = "http://localhost:4000/api"; // change to your backend URL (or ngrok if testing on phone)

// LOGIN
export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return response.data; // contains token + user
};

// REGISTER
// api/auth.ts
export const registerUser = async (payload: { name: string; email: string; password: string; phone?: string }) => {
  const response = await axios.post(`${API_BASE}/auth/register`, payload);
  return response.data;
};

// GET CURRENT USER
export const getMe = async (token: string) => {
  const response = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
