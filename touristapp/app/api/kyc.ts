// app/api/kyc.ts
import axios from "axios";

// Setup axios instance (baseURL can be from env)
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/kyc",
  withCredentials: true,
});

// Tourist submits KYC (with documents)
export const submitKyc = async (formData: FormData) => {
  return await api.post("/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Verify OTP for Aadhaar-based KYC
export const verifyOtpKyc = async (data: { otp: string; requestId: string }) => {
  return await api.post("/verify-otp", data);
};


// Get KYC status by touristId
export const getKycByTourist = async (touristId: string) => {
  return await api.get(`/tourist/${touristId}`);
};

// ---------------- Family Aadhaar Verification ----------------
// Extra endpoint for family member Aadhaar verification
export const verifyFamilyAadhaar = async (data: {
  memberName: string;
  aadhaarNumber: string;
  dob: string;
}) => {
  return await api.post("/verify-family-aadhaar", data);
};

export default {
  submitKyc,
  verifyOtpKyc,
  getKycByTourist,
  verifyFamilyAadhaar,
};
