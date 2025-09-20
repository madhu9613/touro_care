import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { FileText, Upload, CircleCheck as CheckCircle, User, CreditCard, Globe, Smartphone, Shield } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { submitKyc, verifyOtpKyc } from '../api/kyc';
import Storage from '../utils/storage';
import { useAppContext } from '../context/AppContext';

interface Document {
  id: string;
  name: string;
  type: 'passport' | 'aadhaar' | 'visa' | 'photo' | 'other';
  required: boolean;
  uploaded: boolean;
  icon: React.ReactNode;
  uri?: string;
  file?: any;
}

export default function KYCVerification() {
  const { user } = useAppContext();
  const [token, setToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [idType, setIdType] = useState<'aadhaar' | 'passport' | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    passportNumber: '',
    name: '',
    dob: '',
    nationality: 'Indian',
    otp: '',
  });
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [documentStatus, setDocumentStatus] = useState<Document[]>([]);

  // Load token
  useEffect(() => {
    (async () => {
      const storedToken = await Storage.getItem('token');
      setToken(storedToken);
    })();
  }, []);

  // Setup documents
  useEffect(() => {
    if (!idType) return;
    const documents: Document[] = [
      {
        id: 'id_document',
        name: idType === 'aadhaar' ? 'Aadhaar Card (PDF)' : 'Passport Copy (PDF)',
        type: idType === 'aadhaar' ? 'aadhaar' : 'passport',
        required: true,
        uploaded: false,
        icon: <CreditCard size={24} color="#16A34A" />,
      },
      {
        id: 'photo',
        name: 'Recent Photograph',
        type: 'photo',
        required: true,
        uploaded: false,
        icon: <User size={24} color="#8B5CF6" />,
      }
    ];
    if (formData.nationality !== 'Indian') {
      documents.splice(1, 0, {
        id: 'visa',
        name: 'Visa Document (PDF)',
        type: 'visa',
        required: true,
        uploaded: false,
        icon: <FileText size={24} color="#F59E0B" />,
      });
    }
    setDocumentStatus(documents);
  }, [idType, formData.nationality]);

  // API Handlers
  const handleIdSubmit = async () => {
    if (!formData.name || (!formData.aadhaarNumber && idType === 'aadhaar') || (!formData.passportNumber && idType === 'passport') || !formData.dob) {
      return Alert.alert("Error", "Please fill all required fields.");
    }
    setLoading(true);
    try {
      const payload = {
        idType,
        name: formData.name,
        dob: formData.dob,
        aadhaarNumber: formData.aadhaarNumber,
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
      };
      const res = await submitKyc(payload, token!);
      if (res?.requestId && idType === 'aadhaar') {
        setRequestId(res.requestId);
        setCurrentStep(2);
        // Start OTP timer (60 seconds)
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
      } else {
        // Passport or Aadhaar manual verification fallback
        setVerificationFailed(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!formData.otp || !requestId) return Alert.alert("Error", "Enter OTP");
    setLoading(true);
    try {
      const res = await verifyOtpKyc({ otp: formData.otp, requestId }, token!);
      if (res.success) {
        router.replace("/trip-details");
      } else {
        Alert.alert("OTP Failed", "OTP verification failed. Please upload documents for manual verification.");
        setVerificationFailed(true);
        setCurrentStep(1);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (docId: string, docType: string) => {
    try {
      let result: any;
      if (docType === 'photo') {
        result = await ImagePicker.launchImageLibraryAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8
        });
        if (!result.canceled) {
          uploadFile(docId, result.assets[0].uri, docType);
        }
      } else {
        result = await DocumentPicker.getDocumentAsync({ 
          type: 'application/pdf' 
        });
        if (result.assets && result.assets.length > 0) {
          uploadFile(docId, result.assets[0].uri, docType);
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const uploadFile = async (docId: string, uri: string, docType: string) => {
    setLoading(true);
    try {
      // In a real app, you would upload to your backend
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDocumentStatus(prev => prev.map(d => 
        d.id === docId ? { ...d, uploaded: true, uri } : d
      ));
      
      Alert.alert("Success", "Document uploaded successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Upload Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleManualReviewSubmission = async () => {
    const allUploaded = documentStatus.filter(d => d.required).every(d => d.uploaded);
    if (!allUploaded) return Alert.alert("Error", "Please upload all required documents");
    
    // In a real app, you would submit all documents to your backend
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.replace("/trip-details");
    } catch (err) {
      Alert.alert("Error", "Failed to submit documents");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    
    setLoading(true);
    try {
      // In a real app, you would call an API to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      Alert.alert("Success", "OTP has been resent");
    } catch (err) {
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Render Steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tourist Identity Verification</Text>
            <Text style={styles.stepDescription}>
              Verify your identity to complete your tourist registration
            </Text>
            {!idType ? (
              <View style={styles.idOptions}>
                <TouchableOpacity style={styles.idOption} onPress={() => setIdType('aadhaar')}>
                  <View style={styles.optionIcon}>
                    <CreditCard size={32} color="#4F46E5" />
                  </View>
                  <Text style={styles.optionTitle}>Aadhaar Card</Text>
                  <Text style={styles.optionDescription}>For Indian citizens</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.idOption} onPress={() => setIdType('passport')}>
                  <View style={styles.optionIcon}>
                    <Globe size={32} color="#4F46E5" />
                  </View>
                  <Text style={styles.optionTitle}>Passport</Text>
                  <Text style={styles.optionDescription}>For foreign nationals</Text>
                </TouchableOpacity>
              </View>
            ) : !verificationFailed ? (
              <View style={styles.idForm}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={idType === 'aadhaar' ? "Aadhaar Number" : "Passport Number"}
                    placeholderTextColor="#9CA3AF"
                    value={idType === 'aadhaar' ? formData.aadhaarNumber : formData.passportNumber}
                    onChangeText={(text) => setFormData({ ...formData, [idType === 'aadhaar' ? 'aadhaarNumber' : 'passportNumber']: text })}
                    keyboardType={idType === 'aadhaar' ? "number-pad" : "default"}
                    maxLength={idType === 'aadhaar' ? 12 : undefined}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Date of Birth (YYYY-MM-DD)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.dob}
                    onChangeText={(text) => setFormData({ ...formData, dob: text })}
                  />
                </View>
                {idType === 'passport' && (
                  <View style={styles.inputContainer}>
                    <Globe size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nationality"
                      placeholderTextColor="#9CA3AF"
                      value={formData.nationality}
                      onChangeText={(text) => setFormData({ ...formData, nationality: text })}
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleIdSubmit}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> :
                    <Text style={styles.submitButtonText}>Verify {idType === 'aadhaar' ? 'Aadhaar' : 'Passport'}</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.manualVerification}>
                <Text style={styles.sectionTitle}>Manual Verification Required</Text>
                <Text style={styles.sectionDescription}>Please upload the following documents for manual verification.</Text>
                {documentStatus.filter((doc) => doc.required).map((document) => (
                  <View key={document.id} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      {document.icon}
                      <View style={styles.documentText}>
                        <Text style={styles.documentName}>{document.name}</Text>
                        <Text style={styles.documentStatus}>{document.uploaded ? 'Uploaded' : 'Not uploaded'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.uploadButton, document.uploaded && styles.uploadButtonSuccess]}
                      onPress={() => handleDocumentUpload(document.id, document.type)}
                      disabled={loading}
                    >
                      {document.uploaded ? <CheckCircle size={20} color="#FFFFFF" /> : <Upload size={20} color="#4F46E5" />}
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleManualReviewSubmission}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> :
                    <Text style={styles.submitButtonText}>Submit for Manual Verification</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>OTP Verification</Text>
            <Text style={styles.stepDescription}>Enter the OTP sent to your registered mobile number.</Text>
            <View style={styles.otpContainer}>
              <View style={styles.inputContainer}>
                <Smartphone size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  value={formData.otp}
                  onChangeText={(text) => setFormData({ ...formData, otp: text })}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              {otpTimer > 0 && (
                <Text style={styles.timerText}>Resend OTP in {otpTimer}s</Text>
              )}
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                onPress={handleOtpVerify}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> :
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>}
              </TouchableOpacity>
              {otpTimer === 0 && (
                <TouchableOpacity onPress={resendOtp} disabled={loading}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Shield size={32} color="#4F46E5" />
          </View>
          <Text style={styles.title}>SafeTourist</Text>
        </View>
        <Text style={styles.subtitle}>Tourist KYC Verification</Text>
      </View>
      <View style={styles.progressContainer}>
        {[1, 2].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View style={[styles.progressCircle, currentStep >= step && styles.progressCircleActive]}>
              {currentStep > step ?
                <CheckCircle size={16} color="#FFFFFF" /> :
                <Text style={[styles.progressNumber, currentStep >= step && styles.progressNumberActive]}>{step}</Text>}
            </View>
            {step < 2 && <View style={[styles.progressLine, currentStep > step && styles.progressLineActive]} />}
          </View>
        ))}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.securityNote}>🔒 All data is encrypted and secure.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  progressCircleActive: { backgroundColor: '#4F46E5' },
  progressNumber: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  progressNumberActive: { color: '#FFFFFF' },
  progressLine: { width: 60, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  progressLineActive: { backgroundColor: '#4F46E5' },
  content: { flex: 1, paddingHorizontal: 24 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  stepDescription: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  idOptions: { gap: 16 },
  idOption: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  optionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  optionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
  optionDescription: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  idForm: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },
  submitButton: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  manualVerification: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  sectionDescription: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  documentItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  documentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  documentText: { marginLeft: 12, flex: 1 },
  documentName: { fontSize: 16, fontWeight: '500', color: '#1F2937', marginBottom: 4 },
  documentStatus: { fontSize: 14, color: '#6B7280' },
  uploadButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4F46E5' },
  uploadButtonSuccess: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  otpContainer: { gap: 16 },
  verifyButton: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  verifyButtonDisabled: { backgroundColor: '#9CA3AF' },
  verifyButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  timerText: { textAlign: 'center', color: '#EF4444', fontSize: 14 },
  resendText: { textAlign: 'center', color: '#4F46E5', fontSize: 14, textDecorationLine: 'underline' },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  securityNote: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
});