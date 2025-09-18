import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shield, Phone, MapPin, Users, Siren, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

interface EmergencyContact {
  name: string;
  number: string;
  type: 'police' | 'medical' | 'family' | 'embassy';
}

interface EmergencyLog {
  id: string;
  type: string;
  timestamp: string;
  status: 'sent' | 'acknowledged' | 'resolved';
  location?: string;
}

export default function Safety() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [panicPressed, setPanicPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const emergencyContacts: EmergencyContact[] = [
    { name: 'Local Police Station', number: '100', type: 'police' },
    { name: 'Tourist Helpline', number: '1363', type: 'police' },
    { name: 'Medical Emergency', number: '108', type: 'medical' },
    { name: 'Emergency Contact - Sarah', number: '+1-555-0123', type: 'family' },
    { name: 'US Embassy Delhi', number: '+91-11-2419-8000', type: 'embassy' },
  ];

  const emergencyLogs: EmergencyLog[] = [
    {
      id: '1',
      type: 'Location Check',
      timestamp: '2024-01-15 14:30',
      status: 'resolved',
      location: 'Police Bazar, Shillong'
    },
    {
      id: '2',
      type: 'Safety Alert',
      timestamp: '2024-01-15 10:15',
      status: 'acknowledged',
      location: 'Umiam Lake'
    }
  ];

  const startPanicSequence = () => {
    setPanicPressed(true);
    setEmergencyActive(true);
    
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate emergency sequence
    setTimeout(() => {
      Alert.alert(
        'Emergency Alert Sent',
        'Your location and emergency alert have been sent to:\n\n• Local Police (100)\n• Tourist Helpline (1363)\n• Emergency Contact - Sarah\n\nHelp is on the way. Stay calm and stay visible.',
        [
          {
            text: 'I\'m Safe Now',
            onPress: cancelEmergency,
            style: 'cancel'
          },
          {
            text: 'Keep Alert Active',
            style: 'default'
          }
        ]
      );
    }, 2000);
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setPanicPressed(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const callEmergencyNumber = (contact: EmergencyContact) => {
    Alert.alert(
      `Call ${contact.name}?`,
      `This will dial ${contact.number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${contact.number}`);
          }
        }
      ]
    );
  };

  const getContactIcon = (type: EmergencyContact['type']) => {
    switch (type) {
      case 'police': return <Shield size={20} color="#1D4ED8" />;
      case 'medical': return <Phone size={20} color="#DC2626" />;
      case 'family': return <Users size={20} color="#16A34A" />;
      case 'embassy': return <MapPin size={20} color="#F59E0B" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle size={16} color="#16A34A" />;
      case 'acknowledged': return <Clock size={16} color="#F59E0B" />;
      case 'sent': return <AlertTriangle size={16} color="#DC2626" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, emergencyActive && styles.emergencyHeader]}>
          <Text style={styles.headerTitle}>
            {emergencyActive ? '🚨 EMERGENCY ACTIVE' : 'Emergency Safety'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {emergencyActive ? 'Help is being dispatched to your location' : 'Tourist Safety & Emergency Response'}
          </Text>
        </View>

        {/* Panic Button */}
        <View style={styles.panicContainer}>
          <Animated.View style={[
            styles.panicButtonContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <TouchableOpacity
              style={[
                styles.panicButton,
                emergencyActive && styles.panicButtonActive
              ]}
              onPress={emergencyActive ? cancelEmergency : startPanicSequence}
              activeOpacity={0.8}
            >
              <Siren size={48} color="#FFFFFF" />
              <Text style={styles.panicButtonText}>
                {emergencyActive ? 'CANCEL\nEMERGENCY' : 'PANIC\nBUTTON'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.panicDescription}>
            {emergencyActive 
              ? 'Emergency alert is active. Tap to cancel if you are safe.'
              : 'Hold for 3 seconds to send emergency alert with your location to police and emergency contacts.'
            }
          </Text>
        </View>

        {/* Emergency Status */}
        {emergencyActive && (
          <View style={styles.emergencyStatus}>
            <View style={styles.statusHeader}>
              <AlertTriangle size={20} color="#DC2626" />
              <Text style={styles.statusTitle}>Emergency Response Status</Text>
            </View>
            <View style={styles.statusItems}>
              <View style={styles.statusItem}>
                <CheckCircle size={16} color="#16A34A" />
                <Text style={styles.statusText}>Location sent to authorities</Text>
              </View>
              <View style={styles.statusItem}>
                <CheckCircle size={16} color="#16A34A" />
                <Text style={styles.statusText}>Emergency contacts notified</Text>
              </View>
              <View style={styles.statusItem}>
                <Clock size={16} color="#F59E0B" />
                <Text style={styles.statusText}>Police dispatch in progress</Text>
              </View>
            </View>
          </View>
        )}

        {/* Emergency Contacts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => callEmergencyNumber(contact)}
            >
              {getContactIcon(contact.type)}
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <Phone size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Safety Guidelines</Text>
          <View style={styles.safetyTips}>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1</Text>
              <Text style={styles.tipText}>
                Always inform someone about your travel plans and expected return time.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2</Text>
              <Text style={styles.tipText}>
                Stay in well-lit, populated areas, especially during evening hours.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3</Text>
              <Text style={styles.tipText}>
                Keep your digital ID and emergency contacts easily accessible.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4</Text>
              <Text style={styles.tipText}>
                Follow local guidelines and respect restricted area warnings.
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Logs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {emergencyLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                {getStatusIcon(log.status)}
                <Text style={styles.logType}>{log.type}</Text>
                <Text style={styles.logTime}>{log.timestamp}</Text>
              </View>
              {log.location && (
                <Text style={styles.logLocation}>📍 {log.location}</Text>
              )}
            </View>
          ))}
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
    backgroundColor: '#DC2626',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emergencyHeader: {
    backgroundColor: '#991B1B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FCA5A5',
  },
  panicContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  panicButtonContainer: {
    marginBottom: 20,
  },
  panicButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  panicButtonActive: {
    backgroundColor: '#991B1B',
  },
  panicButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  panicDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  emergencyStatus: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
  statusItems: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  safetyTips: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  logTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  logLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 24,
  },
});