import axios from "axios";

const kycApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.concat("/api/kyc") || " https://3f45c820ded9.ngrok-free.app/api/kyc",
  withCredentials: true,
});

const authHeaders = (token?: string) => ({
  headers: { Authorization: token ? `Bearer ${token}` : "" },
});

export const submitKyc = async (data: any, token: string) => {
  const formData = new FormData();

  // Append KYC fields
  formData.append("name", data.name);
  formData.append("dob", data.dob);
  formData.append("nationality", data.nationality);
  if (data.aadhaarNumber) formData.append("aadhaarNumber", data.aadhaarNumber);
  if (data.passportNumber) formData.append("passportNumber", data.passportNumber);

  // Append files if any
  if (data.documents && data.documents.length > 0) {
    data.documents.forEach((doc: any) => {
      if (doc.uri) {
        const uriParts = doc.uri.split("/");
        const fileName = uriParts[uriParts.length - 1];
        formData.append("documents", {
          uri: doc.uri,
          name: fileName,
          type: doc.type === "photo" ? "image/jpeg" : "application/pdf",
        } as any);
      }
    });
  }

  const res = await kycApi.post("/submit", formData, {
    ...authHeaders(token),
    headers: { ...authHeaders(token).headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const verifyOtpKyc = async (data: { otp: string; requestId: string }, token: string) => {
  const res = await kycApi.post("/verify-otp", data, authHeaders(token));
  return res.data;
};

export const getKycByTourist = async (touristId: string, token: string) => {
  const res = await kycApi.get(`/tourist/${touristId}`, authHeaders(token));
  return res.data;
};

export const reviewKyc = async (requestId: string, data: { status: "approved" | "rejected"; comment?: string }, token: string) => {
  const res = await kycApi.post(`/review/${requestId}`, data, authHeaders(token));
  return res.data;
};

export default { submitKyc, verifyOtpKyc, getKycByTourist, reviewKyc };
