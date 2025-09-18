import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QrCode, User, Calendar, MapPin, Phone, Copy } from 'lucide-react-native';

interface TouristInfo {
  id: string;
  name: string;
  nationality: string;
  passportNumber: string;
  checkInDate: string;
  checkOutDate: string;
  emergencyContact: string;
  currentLocation: string;
  blockchainHash: string;
}

export default function DigitalID() {
  const [showQR, setShowQR] = useState(false);
  
  // Mock tourist data - in real app this would come from secure storage/blockchain
  const touristInfo: TouristInfo = {
    id: 'TID-NE-2024-001523',
    name: 'John Anderson',
    nationality: 'United States',
    passportNumber: 'US123456789',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-22',
    emergencyContact: '+91-98765-43210',
    currentLocation: 'Shillong, Meghalaya',
    blockchainHash: '0x7b2a3c8f9e1d4a6b5c8e9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
  };

  const copyToClipboard = (text: string, label: string) => {
    // In a real app, you'd use Clipboard.setString() from @react-native-clipboard/clipboard
    console.log(`Copied ${label}: ${text}`);
  };

  const generateQRCode = () => {
    setShowQR(!showQR);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Digital Tourist ID</Text>
          <Text style={styles.headerSubtitle}>Blockchain Verified Identity</Text>
        </View>

        {/* ID Card */}
        <View style={styles.idCard}>
          {/* Government Header */}
          <View style={styles.govHeader}>
            <Text style={styles.govTitle}>Government of India</Text>
            <Text style={styles.govSubtitle}>Ministry of Tourism - NE Region</Text>
            <Text style={styles.idType}>DIGITAL TOURIST IDENTIFICATION</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <User size={48} color="#6B7280" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.touristName}>{touristInfo.name}</Text>
              <Text style={styles.touristId}>ID: {touristInfo.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>VERIFIED</Text>
              </View>
            </View>
          </View>

          {/* Tourist Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nationality:</Text>
              <Text style={styles.infoValue}>{touristInfo.nationality}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Passport:</Text>
              <Text style={styles.infoValue}>{touristInfo.passportNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Visit Period:</Text>
              <Text style={styles.infoValue}>
                {touristInfo.checkInDate} to {touristInfo.checkOutDate}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Location:</Text>
              <Text style={styles.infoValue}>{touristInfo.currentLocation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Emergency Contact:</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(touristInfo.emergencyContact, 'Emergency Contact')}
              >
                <Text style={styles.infoValue}>{touristInfo.emergencyContact}</Text>
                <Copy size={14} color="#1D4ED8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Blockchain Verification */}
          <View style={styles.blockchainSection}>
            <Text style={styles.blockchainTitle}>Blockchain Verification</Text>
            <TouchableOpacity 
              style={styles.hashContainer}
              onPress={() => copyToClipboard(touristInfo.blockchainHash, 'Blockchain Hash')}
            >
              <Text style={styles.hashText} numberOfLines={2}>
                {touristInfo.blockchainHash}
              </Text>
              <Copy size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.qrButton} onPress={generateQRCode}>
            <QrCode size={20} color="#1D4ED8" />
            <Text style={styles.qrButtonText}>
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </Text>
          </TouchableOpacity>
          
          {showQR && (
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <QrCode size={120} color="#1D4ED8" />
                <Text style={styles.qrNote}>
                  QR Code for verification{'\n'}Present to authorities when required
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <Calendar size={24} color="#16A34A" />
              <Text style={styles.actionText}>Trip Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <MapPin size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Update Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Phone size={24} color="#DC2626" />
              <Text style={styles.actionText}>Emergency Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <User size={24} color="#1D4ED8" />
              <Text style={styles.actionText}>Profile Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityText}>
            🔒 Your digital ID is secured with blockchain technology and end-to-end encryption. 
            Never share your ID details with unauthorized persons.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1D4ED8',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  idCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  govHeader: {
    backgroundColor: '#1E40AF',
    padding: 16,
    alignItems: 'center',
  },
  govTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  govSubtitle: {
    fontSize: 12,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  idType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FEF3C7',
    letterSpacing: 1,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  touristName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  touristId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  blockchainSection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  blockchainTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hashText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1D4ED8',
    backgroundColor: '#FFFFFF',
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  qrNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  securityNotice: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  securityText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});