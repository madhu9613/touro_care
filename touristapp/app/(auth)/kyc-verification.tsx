// screens/KYCVerification.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CreditCard, CheckCircle } from 'lucide-react-native';
import { submitKyc, verifyOtpKyc } from '../services/kyc';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function KYCVerification() {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [requestId, setRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    dob: '',
    aadhaarNumber: '',
    otp: '',
  });

  /** -------------------- Handlers -------------------- */

  const handleSubmitKyc = async () => {
    const { name, dob, aadhaarNumber } = formData;
    if (!name || !dob || !aadhaarNumber) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    setLoading(true);
    try {
      const res = await submitKyc({ name, dob, aadhaarNumber });
      if (res.success && res.data?.requestId) {
        setRequestId(res.data.requestId);
        setCurrentStep(2);
        startOtpTimer();
        Alert.alert('Success', res.data.message);
      } else {
        Alert.alert('Error', res.message || 'KYC submission failed');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || !requestId) return Alert.alert('Error', 'Enter OTP');
    setLoading(true);
    try {
      const res = await verifyOtpKyc({ requestId, otp: formData.otp });
      if (res.success) {
        Alert.alert('Success', res.data?.message || 'KYC Verified');
      } else {
        Alert.alert('Error', res.message || 'OTP verification failed');
        setCurrentStep(1);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  /** -------------------- OTP Timer -------------------- */
  const startOtpTimer = () => {
    setOtpTimer(60);
    const timerInterval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = () => {
    if (otpTimer > 0) return;
    Alert.alert('OTP', 'OTP resent (demo)');
    startOtpTimer();
  };

  /** -------------------- Render -------------------- */
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.title}>Aadhaar Verification</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={formData.dob}
            onChangeText={(text) => setFormData({ ...formData, dob: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Aadhaar Number"
            value={formData.aadhaarNumber}
            onChangeText={(text) => setFormData({ ...formData, aadhaarNumber: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitKyc}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.title}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            value={formData.otp}
            onChangeText={(text) => setFormData({ ...formData, otp: text })}
            keyboardType="numeric"
          />
          <Text style={styles.otpText}>OTP expires in: {otpTimer}s</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOtp}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Verify OTP</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendBtn} onPress={resendOtp}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      {renderStepContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f9fafb' },
  stepContent: { marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
  submitBtn: { backgroundColor: '#4F46E5', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  otpText: { marginVertical: 10, textAlign: 'center', color: '#ef4444' },
  resendBtn: { marginTop: 10, alignItems: 'center' },
  resendText: { color: '#4F46E5', fontWeight: 'bold' },
});
