import axios from "axios";

const kycApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.concat("/api/kyc") || "http://localhost:4000/api/kyc",
  withCredentials: true,
});

const authHeaders = (token?: string) => ({
  headers: { Authorization: token ? `Bearer ${token}` : "" }
});

export const submitKyc = (formData: FormData, token: string) => {
  return kycApi.post("/submit", formData, {
    ...authHeaders(token),
    headers: { ...authHeaders(token).headers, "Content-Type": "multipart/form-data" },
  });
};

export const verifyOtpKyc = (data: { otp: string; requestId: string }, token: string) => {
  return kycApi.post("/verify-otp", data, authHeaders(token));
};

export const getKycByTourist = (touristId: string, token: string) => {
  return kycApi.get(`/tourist/${touristId}`, authHeaders(token));
};

export const verifyFamilyAadhaar = (data: { memberName: string; aadhaarNumber: string; dob: string }, token: string) => {
  return kycApi.post("/verify-family-aadhaar", data, authHeaders(token));
};



export default { submitKyc, verifyOtpKyc, getKycByTourist, verifyFamilyAadhaar };
