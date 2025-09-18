import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { FileText, Upload, CircleCheck as CheckCircle, User, CreditCard, Shield, Globe, Smartphone } from 'lucide-react-native';

interface Document {
  id: string;
  name: string;
  type: 'passport' | 'aadhaar' | 'visa' | 'photo';
  required: boolean;
  uploaded: boolean;
  icon: React.ReactNode;
}

export default function KYCVerification() {
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
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const documents: Document[] = [
    {
      id: 'id_document',
      name: idType === 'aadhaar' ? 'Aadhaar Card (Front & Back)' : 'Passport Copy',
      type: idType === 'aadhaar' ? 'aadhaar' : 'passport',
      required: verificationFailed,
      uploaded: false,
      icon: <CreditCard size={24} color="#16A34A" />
    },
    {
      id: 'visa',
      name: 'Visa Document (If Applicable)',
      type: 'visa',
      required: formData.nationality !== 'Indian' && verificationFailed,
      uploaded: false,
      icon: <FileText size={24} color="#F59E0B" />
    },
    {
      id: 'photo',
      name: 'Recent Photograph',
      type: 'photo',
      required: verificationFailed,
      uploaded: false,
      icon: <User size={24} color="#8B5CF6" />
    }
  ];

  const [documentStatus, setDocumentStatus] = useState(documents);

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(300); // 5 minutes in seconds
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleIdSubmit = () => {
    if (!formData.name || !formData.dob) {
      Alert.alert('Error', 'Please fill all required details');
      return;
    }

    if (idType === 'aadhaar' && !formData.aadhaarNumber) {
      Alert.alert('Error', 'Please enter Aadhaar number');
      return;
    }

    if (idType === 'passport' && !formData.passportNumber) {
      Alert.alert('Error', 'Please enter passport number');
      return;
    }

    // Simulate ID verification
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Mock verification - 80% success rate for demo
      const isVerificationSuccess = Math.random() > 0.2;
      
      if (isVerificationSuccess) {
        if (idType === 'aadhaar') {
          Alert.alert('OTP Sent', 'OTP has been sent to your registered mobile number');
          setOtpSent(true);
          startOtpTimer();
          setCurrentStep(2);
        } else {
          // Passport verification is instant (no OTP)
          Alert.alert('Success', 'Passport verified successfully!');
          setCurrentStep(3);
        }
      } else {
        Alert.alert(
          'Verification Required', 
          'ID verification failed. Please upload documents for manual verification.',
          [{ text: 'OK', onPress: () => setVerificationFailed(true) }]
        );
      }
    }, 1500);
  };

  const handleOtpVerify = () => {
    if (!formData.otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock OTP verification
      if (formData.otp === '123456') { // Demo OTP
        Alert.alert('Success', 'Aadhaar verified successfully!');
        setCurrentStep(3);
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    }, 1000);
  };

  const handleDocumentUpload = (documentId: string) => {
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        {
          text: 'Camera',
          onPress: () => simulateUpload(documentId, 'camera')
        },
        {
          text: 'Gallery',
          onPress: () => simulateUpload(documentId, 'gallery')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const simulateUpload = (documentId: string, method: string) => {
    setDocumentStatus(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploaded: true }
          : doc
      )
    );
    
    Alert.alert('Success', `Document uploaded successfully via ${method}`);
  };

  const handleContinue = () => {
    if (currentStep === 1 && verificationFailed) {
      const requiredDocs = documentStatus.filter(doc => doc.required);
      const uploadedRequiredDocs = requiredDocs.filter(doc => doc.uploaded);
      
      if (uploadedRequiredDocs.length < requiredDocs.length) {
        Alert.alert('Error', 'Please upload all required documents');
        return;
      }
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep(3); // Move to review step
      }, 1500);
    } else if (currentStep === 3) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.push('/(auth)/trip-details');
      }, 2000);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Identity Verification</Text>
            <Text style={styles.stepDescription}>
              Verify your identity using Aadhaar (Indian citizens) or Passport (foreign nationals)
            </Text>
            
            {!idType ? (
              <View style={styles.idOptions}>
                <TouchableOpacity 
                  style={styles.idOption}
                  onPress={() => {
                    setIdType('aadhaar');
                    setFormData({...formData, nationality: 'Indian'});
                  }}
                >
                  <View style={styles.optionIcon}>
                    <CreditCard size={32} color="#4F46E5" />
                  </View>
                  <Text style={styles.optionTitle}>Aadhaar Card</Text>
                  <Text style={styles.optionDescription}>
                    For Indian citizens with Aadhaar card
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.idOption}
                  onPress={() => {
                    setIdType('passport');
                    setFormData({...formData, nationality: 'Foreign'});
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Globe size={32} color="#4F46E5" />
                  </View>
                  <Text style={styles.optionTitle}>Passport</Text>
                  <Text style={styles.optionDescription}>
                    For foreign nationals with passport
                  </Text>
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
                    onChangeText={(text) => setFormData({...formData, name: text})}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={idType === 'aadhaar' ? "Aadhaar Number" : "Passport Number"}
                    placeholderTextColor="#9CA3AF"
                    value={idType === 'aadhaar' ? formData.aadhaarNumber : formData.passportNumber}
                    onChangeText={(text) => setFormData({
                      ...formData, 
                      [idType === 'aadhaar' ? 'aadhaarNumber' : 'passportNumber']: text
                    })}
                    keyboardType={idType === 'aadhaar' ? "number-pad" : "default"}
                    maxLength={idType === 'aadhaar' ? 12 : undefined}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Date of Birth (DD/MM/YYYY)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.dob}
                    onChangeText={(text) => setFormData({...formData, dob: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nationality"
                    placeholderTextColor="#9CA3AF"
                    value={formData.nationality}
                    onChangeText={(text) => setFormData({...formData, nationality: text})}
                  />
                </View>
                
                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleIdSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Verifying...' : `Verify ${idType === 'aadhaar' ? 'Aadhaar' : 'Passport'}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.manualVerification}>
                <Text style={styles.sectionTitle}>Upload Required Documents</Text>
                <Text style={styles.sectionDescription}>
                  Please upload clear photos of the following documents for manual verification.
                </Text>
                
                {documentStatus.map((document) => (
                  <View key={document.id} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      {document.icon}
                      <View style={styles.documentText}>
                        <Text style={styles.documentName}>{document.name}</Text>
                        <Text style={styles.documentStatus}>
                          {document.required ? 'Required' : 'Optional'} • {document.uploaded ? 'Uploaded' : 'Not uploaded'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        document.uploaded && styles.uploadButtonSuccess
                      ]}
                      onPress={() => handleDocumentUpload(document.id)}
                    >
                      {document.uploaded ? (
                        <CheckCircle size={20} color="#FFFFFF" />
                      ) : (
                        <Upload size={20} color="#4F46E5" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>OTP Verification</Text>
            <Text style={styles.stepDescription}>
              Enter the OTP sent to your registered mobile number ending with XXXX
            </Text>
            
            <View style={styles.otpContainer}>
              <View style={styles.inputContainer}>
                <Smartphone size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  value={formData.otp}
                  onChangeText={(text) => setFormData({...formData, otp: text})}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              
              {otpTimer > 0 ? (
                <Text style={styles.otpTimer}>
                  OTP expires in: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </Text>
              ) : (
                <TouchableOpacity onPress={() => {
                  setOtpSent(true);
                  startOtpTimer();
                  Alert.alert('OTP Resent', 'New OTP has been sent to your mobile number');
                }}>
                  <Text style={styles.resendOtp}>Resend OTP</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                onPress={handleOtpVerify}
                disabled={loading}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Verification Complete</Text>
            <Text style={styles.stepDescription}>
              Your identity verification has been completed successfully.
            </Text>
            
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <CheckCircle size={48} color="#16A34A" />
              </View>
              <Text style={styles.successTitle}>Verification Successful</Text>
              <Text style={styles.successDescription}>
                Your KYC verification is complete. Your digital tourist ID will be generated after trip details submission.
              </Text>
            </View>
            
            <View style={styles.reviewContainer}>
              <View style={styles.reviewItem}>
                <CheckCircle size={20} color="#16A34A" />
                <Text style={styles.reviewText}>Identity verified</Text>
              </View>
              <View style={styles.reviewItem}>
                <CheckCircle size={20} color="#16A34A" />
                <Text style={styles.reviewText}>Documents validated</Text>
              </View>
              {idType === 'aadhaar' && (
                <View style={styles.reviewItem}>
                  <CheckCircle size={20} color="#16A34A" />
                  <Text style={styles.reviewText}>Aadhaar authentication completed</Text>
                </View>
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Shield size={32} color="#4F46E5" />
          </View>
          <Text style={styles.title}>SafeTourist</Text>
        </View>
        <Text style={styles.subtitle}>KYC Verification</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              currentStep >= step && styles.progressCircleActive
            ]}>
              {currentStep > step ? (
                <CheckCircle size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.progressNumber,
                  currentStep >= step && styles.progressNumberActive
                ]}>
                  {step}
                </Text>
              )}
            </View>
            {step < 3 && (
              <View style={[
                styles.progressLine,
                currentStep > step && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep === 3 && (
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Processing...' : 'Continue to Trip Details'}
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.securityNote}>
          🔒 All data is encrypted and secure. Your identification details are protected.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#4F46E5',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#4F46E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  idOptions: {
    gap: 16,
  },
  idOption: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  idForm: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  manualVerification: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentText: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  uploadButtonSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  otpContainer: {
    gap: 16,
  },
  otpTimer: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  resendOtp: {
    fontSize: 14,
    color: '#4F46E5',
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  securityNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});