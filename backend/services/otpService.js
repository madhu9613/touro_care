'use strict';
const otpStore = new Map(); // simple in-memory store for demo

exports.sendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);
  console.log(`OTP sent to ${phone}: ${otp}`); // in real app, use Twilio/SMS API
  return otp;
};

exports.verifyOtp = (phone, otp) => {
  const valid = otpStore.get(phone) === otp;
  if (valid) otpStore.delete(phone);
  return valid;
};
