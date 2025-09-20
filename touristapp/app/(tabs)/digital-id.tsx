import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QrCode, User, Calendar, MapPin, Phone, Copy, Shield, IndianRupee, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

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
  const [activeTab, setActiveTab] = useState('details');
  
  // Mock tourist data
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      console.log(`Copied ${label}: ${text}`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQRCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowQR(!showQR);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background decorative elements */}
      <View style={styles.backgroundBlur} />
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Digital Tourist ID</Text>
            <Text style={styles.headerSubtitle}>Blockchain Verified Identity</Text>
          </View>
          <View style={styles.headerIcon}>
            <Shield size={24} color="#FFFFFF" fill="#10B981" />
          </View>
        </View>

        {/* ID Card */}
        <View style={styles.idCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Card pattern overlay */}
            <View style={styles.cardPattern} />
            
            {/* Government Header */}
            <View style={styles.govHeader}>
              <View style={styles.flagContainer}>
                <View style={styles.flagIcon}>
                  <IndianRupee size={16} color="#FF9933" />
                </View>
                <Text style={styles.govTitle}>Government of India</Text>
              </View>
              <Text style={styles.govSubtitle}>Ministry of Tourism - NE Region</Text>
            </View>

            {/* ID Type Badge */}
            <View style={styles.idTypeContainer}>
              <Text style={styles.idType}>DIGITAL TOURIST ID</Text>
              <View style={styles.verifiedBadge}>
                <Shield size={12} color="#10B981" />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.profileImageContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <User size={36} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.touristName}>{touristInfo.name}</Text>
                <Text style={styles.touristId}>{touristInfo.id}</Text>
              </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'details' && styles.activeTab]}
                onPress={() => setActiveTab('details')}
              >
                <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'security' && styles.activeTab]}
                onPress={() => setActiveTab('security')}
              >
                <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>
                  Security
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tourist Information */}
            {activeTab === 'details' && (
              <View style={styles.infoSection}>
                <InfoRow 
                  label="Nationality" 
                  value={touristInfo.nationality} 
                  icon="🌎"
                />
                <InfoRow 
                  label="Passport" 
                  value={touristInfo.passportNumber} 
                  icon="📘"
                  onPress={() => copyToClipboard(touristInfo.passportNumber, 'Passport Number')}
                />
                <InfoRow 
                  label="Visit Period" 
                  value={`${formatDate(touristInfo.checkInDate)} - ${formatDate(touristInfo.checkOutDate)}`} 
                  icon="📅"
                />
                <InfoRow 
                  label="Current Location" 
                  value={touristInfo.currentLocation} 
                  icon="📍"
                />
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Text style={styles.infoIcon}>📞</Text>
                    <Text style={styles.infoLabel}>Emergency Contact:</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(touristInfo.emergencyContact, 'Emergency Contact')}
                  >
                    <Text style={styles.infoValue}>{touristInfo.emergencyContact}</Text>
                    <Copy size={14} color="#818CF8" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Security Information */}
            {activeTab === 'security' && (
              <View style={styles.infoSection}>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityTitle}>Blockchain Verification</Text>
                  <Text style={styles.securityDescription}>
                    Your identity is securely stored on a distributed blockchain network, ensuring tamper-proof verification.
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.hashContainer}
                    onPress={() => copyToClipboard(touristInfo.blockchainHash, 'Blockchain Hash')}
                  >
                    <Text style={styles.hashLabel}>Transaction Hash:</Text>
                    <View style={styles.hashValueContainer}>
                      <Text style={styles.hashText} numberOfLines={1}>
                        {touristInfo.blockchainHash}
                      </Text>
                      <Copy size={14} color="#818CF8" />
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.securityFeatures}>
                    <View style={styles.securityFeature}>
                      <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Shield size={16} color="#10B981" />
                      </View>
                      <Text style={styles.featureText}>Encrypted Data</Text>
                    </View>
                    <View style={styles.securityFeature}>
                      <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Shield size={16} color="#3B82F6" />
                      </View>
                      <Text style={styles.featureText}>Biometric Lock</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* QR Code Section */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={generateQRCode}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={showQR ? ['#6366F1', '#818CF8'] : ['#FFFFFF', '#F8FAFC']}
              style={styles.qrButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <QrCode size={20} color={showQR ? '#FFFFFF' : '#6366F1'} />
              <Text style={[styles.qrButtonText, { color: showQR ? '#FFFFFF' : '#6366F1' }]}>
                {showQR ? 'Hide QR Code' : 'Show Verification QR'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {showQR && (
            <View style={styles.qrContainer}>
              <LinearGradient
                colors={['#F8FAFC', '#F1F5F9']}
                style={styles.qrPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.qrIconContainer}>
                  <QrCode size={120} color="#6366F1" />
                </View>
                <Text style={styles.qrNote}>
                  Present this QR code to authorities for verification
                </Text>
                <Text style={styles.qrExpiry}>Valid for 60 seconds</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionItem 
              icon={<Calendar size={20} color="#10B981" />} 
              text="Trip Details"
              color="#10B981" 
            />
            <ActionItem 
              icon={<MapPin size={20} color="#F59E0B" />} 
              text="Update Location"
              color="#F59E0B" 
            />
            <ActionItem 
              icon={<Phone size={20} color="#EF4444" />} 
              text="Emergency Call"
              color="#EF4444" 
            />
            <ActionItem 
              icon={<User size={20} color="#6366F1" />} 
              text="Profile Update"
              color="#6366F1" 
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            <ActivityItem 
              time="10:24 AM"
              location="Guwahati Airport"
              action="Identity Verified"
              status="success"
            />
            <ActivityItem 
              time="09:45 AM"
              location="Shillong Checkpoint"
              action="Location Updated"
              status="success"
            />
            <ActivityItem 
              time="Yesterday"
              location="Digital ID App"
              action="Profile Accessed"
              status="neutral"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable Components
const InfoRow = ({ label, value, icon, onPress }: { label: string; value: string; icon: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
    <View style={styles.infoLabelContainer}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}:</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </TouchableOpacity>
);

const ActionItem = ({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) => (
  <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
    <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ time, location, action, status }: { time: string; location: string; action: string; status: string }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityTimeContainer}>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityAction}>{action}</Text>
      <Text style={styles.activityLocation}>{location}</Text>
    </View>
    <View style={[styles.activityStatus, 
      status === 'success' ? styles.activityStatusSuccess : 
      status === 'warning' ? styles.activityStatusWarning : 
      styles.activityStatusNeutral
    ]} />
  </View>
);

// Helper function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#0F172A',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  idCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 0,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: '#FFFFFF',
  },
  govHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  flagIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  govTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  govSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  idTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  idType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF3C7',
    letterSpacing: 1,
    marginRight: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileInfo: {
    flex: 1,
  },
  touristName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  touristId: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#818CF8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  infoSection: {
    padding: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'center',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityInfo: {
    marginTop: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 20,
  },
  hashContainer: {
    marginBottom: 20,
  },
  hashLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  hashValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hashText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  securityFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  qrButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  qrButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  qrContainer: {
    marginTop: 20,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrIconContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  qrNote: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
  },
  qrExpiry: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 108) / 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityTimeContainer: {
    width: 80,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activityContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  activityAction: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  activityStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityStatusSuccess: {
    backgroundColor: '#10B981',
  },
  activityStatusWarning: {
    backgroundColor: '#F59E0B',
  },
  activityStatusNeutral: {
    backgroundColor: '#94A3B8',
  },
});