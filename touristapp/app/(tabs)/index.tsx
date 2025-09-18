import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin, TriangleAlert as AlertTriangle, Shield, Clock, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface SafetyAlert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  message: string;
  time: string;
}

export default function Dashboard() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [safetyScore, setSafetyScore] = useState(85);
  const [isTracking, setIsTracking] = useState(false);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([
    {
      id: '1',
      type: 'info',
      message: 'Welcome to Shillong! You are in a safe tourist zone.',
      time: '10:30 AM'
    },
    {
      id: '2',
      type: 'warning', 
      message: 'Approaching restricted area near Umiam Lake after 6 PM.',
      time: '10:25 AM'
    }
  ]);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for safety monitoring.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Shillong, Meghalaya, India'
      });
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    Alert.alert(
      isTracking ? 'Tracking Disabled' : 'Tracking Enabled',
      isTracking 
        ? 'Real-time location sharing has been disabled.'
        : 'Your location is now being shared with emergency contacts and authorities for safety monitoring.'
    );
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#F59E0B';
    return '#DC2626';
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return '#DC2626';
      case 'warning': return '#F59E0B';
      default: return '#1D4ED8';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tourist Safety Dashboard</Text>
          <Text style={styles.headerSubtitle}>Ministry of Tourism - NE Region</Text>
        </View>

        {/* Safety Score Card */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
            <Shield size={24} color={getSafetyColor(safetyScore)} />
            <Text style={styles.cardTitle}>Safety Score</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: getSafetyColor(safetyScore) }]}>
              {safetyScore}
            </Text>
            <Text style={styles.scoreLabel}>/ 100</Text>
          </View>
          <Text style={styles.scoreDescription}>
            Based on current location, time, and travel patterns
          </Text>
          <View style={[styles.scoreBar, { backgroundColor: '#F3F4F6' }]}>
            <View 
              style={[
                styles.scoreProgress, 
                { 
                  width: `${safetyScore}%`, 
                  backgroundColor: getSafetyColor(safetyScore) 
                }
              ]} 
            />
          </View>
        </View>

        {/* Current Location */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#1D4ED8" />
            <Text style={styles.cardTitle}>Current Location</Text>
          </View>
          {location ? (
            <View>
              <Text style={styles.locationText}>{location.address}</Text>
              <Text style={styles.coordinates}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity style={styles.trackingButton} onPress={toggleTracking}>
                <Navigation size={16} color={isTracking ? '#FFFFFF' : '#1D4ED8'} />
                <Text style={[styles.trackingButtonText, { 
                  color: isTracking ? '#FFFFFF' : '#1D4ED8' 
                }]}>
                  {isTracking ? 'Tracking Active' : 'Enable Tracking'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.loadingText}>Getting your location...</Text>
          )}
        </View>

        {/* Recent Alerts */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.cardTitle}>Recent Alerts</Text>
          </View>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: getAlertColor(alert.type) }]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <View style={styles.alertTime}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.alertTimeText}>{alert.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionButton, styles.emergencyButton]}>
              <Shield size={20} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>Emergency Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.reportButton]}>
              <AlertTriangle size={20} color="#1D4ED8" />
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    backgroundColor: '#FFFFFF',
  },
  trackingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  reportButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  reportButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
    marginLeft: 6,
  },
});