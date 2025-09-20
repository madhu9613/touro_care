import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { CreditCard, Globe, User, FileText, Upload, CheckCircle, Shield, Smartphone } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { submitKyc, verifyOtpKyc } from "../api/kyc";
import Storage from "../utils/storage";
import { useAppContext } from "../context/AppContext";

interface Document {
  id: string;
  name: string;
  type: "passport" | "aadhaar" | "visa" | "photo" | "other";
  required: boolean;
  uploaded: boolean;
  uri?: string;
  file?: any;
  icon: React.ReactNode;
}

export default function KYCVerification() {
  const { user } = useAppContext();
  const [token, setToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [idType, setIdType] = useState<"aadhaar" | "passport" | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [documentStatus, setDocumentStatus] = useState<Document[]>([]);

  const [formData, setFormData] = useState({
    aadhaarNumber: "",
    passportNumber: "",
    name: "",
    dob: "",
    nationality: "Indian",
    otp: "",
  });

  // Load token
  useEffect(() => {
    (async () => {
      const storedToken = await Storage.getItem("token");
      setToken(storedToken);
    })();
  }, []);

  // Setup document requirements
  useEffect(() => {
    if (!idType) return;
    const docs: Document[] = [
      {
        id: "id_document",
        name: idType === "aadhaar" ? "Aadhaar Card (PDF)" : "Passport Copy (PDF)",
        type: idType === "aadhaar" ? "aadhaar" : "passport",
        required: true,
        uploaded: false,
        icon: <CreditCard size={24} color="#16A34A" />,
      },
      {
        id: "photo",
        name: "Recent Photograph",
        type: "photo",
        required: true,
        uploaded: false,
        icon: <User size={24} color="#8B5CF6" />,
      },
    ];
    if (formData.nationality !== "Indian") {
      docs.splice(1, 0, {
        id: "visa",
        name: "Visa Document (PDF)",
        type: "visa",
        required: true,
        uploaded: false,
        icon: <FileText size={24} color="#F59E0B" />,
      });
    }
    setDocumentStatus(docs);
  }, [idType, formData.nationality]);

  /** -------------------- Handlers -------------------- */

  // Submit KYC
  const handleIdSubmit = async () => {
    if (!formData.name || (!formData.aadhaarNumber && idType === "aadhaar") || (!formData.passportNumber && idType === "passport") || !formData.dob) {
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
        documents: documentStatus,
      };
      const res = await submitKyc(payload, token!);

      if (res?.requestId && idType === "aadhaar") {
        setRequestId(res.requestId);
        setCurrentStep(2);
        startOtpTimer();
      } else {
        setVerificationFailed(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleOtpVerify = async () => {
    if (!formData.otp || !requestId) return Alert.alert("Error", "Enter OTP");
    setLoading(true);
    try {
      const res = await verifyOtpKyc({ otp: formData.otp, requestId }, token!);
      if (res.success) {
        router.replace("/trip-details");
      } else {
        Alert.alert("OTP Failed", "OTP verification failed. Upload documents for manual review.");
        setVerificationFailed(true);
        setCurrentStep(1);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Document Picker
  const handleDocumentUpload = async (docId: string, docType: string) => {
    try {
      let result: any;
      if (docType === "photo") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
        if (!result.canceled) uploadFile(docId, result.assets[0].uri, docType);
      } else {
        result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        if (!result.canceled) uploadFile(docId, result.uri, docType);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  // Simulate file upload
  const uploadFile = async (docId: string, uri: string, docType: string) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // Mock upload
      setDocumentStatus((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, uploaded: true, uri } : d))
      );
      Alert.alert("Success", "Document uploaded successfully");
    } catch {
      Alert.alert("Error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualReviewSubmission = async () => {
    const allUploaded = documentStatus.filter((d) => d.required).every((d) => d.uploaded);
    if (!allUploaded) return Alert.alert("Error", "Please upload all required documents");

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500)); // Mock submit
      router.replace("/trip-details");
    } catch {
      Alert.alert("Error", "Failed to submit documents");
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
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

  const resendOtp = async () => {
    if (otpTimer > 0) return;
    startOtpTimer();
    Alert.alert("Success", "OTP resent");
  };

  /** -------------------- Render -------------------- */

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Identity input / manual
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tourist Identity Verification</Text>
            {!idType ? (
              <View style={styles.idOptions}>
                <TouchableOpacity style={styles.idOption} onPress={() => setIdType("aadhaar")}>
                  <CreditCard size={32} color="#4F46E5" />
                  <Text style={styles.optionTitle}>Aadhaar Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.idOption} onPress={() => setIdType("passport")}>
                  <Globe size={32} color="#4F46E5" />
                  <Text style={styles.optionTitle}>Passport</Text>
                </TouchableOpacity>
              </View>
            ) : !verificationFailed ? (
              <View style={styles.idForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder={idType === "aadhaar" ? "Aadhaar Number" : "Passport Number"}
                  value={idType === "aadhaar" ? formData.aadhaarNumber : formData.passportNumber}
                  onChangeText={(text) =>
                    setFormData(
                      idType === "aadhaar"
                        ? { ...formData, aadhaarNumber: text }
                        : { ...formData, passportNumber: text }
                    )
                  }
                  keyboardType={idType === "aadhaar" ? "numeric" : "default"}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  value={formData.dob}
                  onChangeText={(text) => setFormData({ ...formData, dob: text })}
                />
                <TouchableOpacity style={styles.submitBtn} onPress={handleIdSubmit}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.manualUpload}>
                <Text style={styles.stepTitle}>Manual Document Upload</Text>
                {documentStatus.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.docRow, doc.uploaded && styles.docUploaded]}
                    onPress={() => handleDocumentUpload(doc.id, doc.type)}
                  >
                    {doc.icon}
                    <Text style={styles.docText}>{doc.name}</Text>
                    {doc.uploaded && <CheckCircle size={24} color="#16A34A" />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.submitBtn} onPress={handleManualReviewSubmission}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Documents</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 2: // OTP
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Enter Aadhaar OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              value={formData.otp}
              onChangeText={(text) => setFormData({ ...formData, otp: text })}
              keyboardType="numeric"
            />
            <Text style={styles.otpText}>OTP expires in: {otpTimer}s</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={handleOtpVerify}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Verify OTP</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendBtn} onPress={resendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      {renderStepContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f9fafb" },
  stepContent: { marginTop: 30 },
  stepTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  idOptions: { flexDirection: "row", justifyContent: "space-around" },
  idOption: { alignItems: "center", padding: 20, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  optionTitle: { marginTop: 8, fontSize: 16 },
  idForm: { marginTop: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15 },
  submitBtn: { backgroundColor: "#4F46E5", padding: 15, borderRadius: 8, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  manualUpload: { marginTop: 20 },
  docRow: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 },
  docUploaded: { borderColor: "#16A34A", backgroundColor: "#dcfce7" },
  docText: { flex: 1, marginLeft: 12 },
  otpText: { marginVertical: 10, textAlign: "center", color: "#ef4444" },
  resendBtn: { marginTop: 10, alignItems: "center" },
  resendText: { color: "#4F46E5", fontWeight: "bold" },
});
