import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Smart Tourist Safety',
    subtitle: 'Monitoring & Response System',
    description: 'AI-Powered safety monitoring with anomaly detection to ensure tourists are safe in high-risk zones.',
    image: require('../assets/images/pic2.jpg'), // Replace with your actual image path
  },
  {
    key: '2',
    title: 'Blockchain Digital ID',
    subtitle: 'Secure & Tamper-proof',
    description: 'Generate a blockchain-based digital ID with KYC, trip itinerary, and emergency contacts valid for the duration of your visit.',
    image: require('../assets/images/pic2.jpg'), // Replace with your actual image path
  },
  {
    key: '3',
    title: 'Real-time Alerts',
    subtitle: 'Geo-fencing & Panic Response',
    description: 'Receive alerts when entering high-risk areas and use the panic button to notify police and emergency contacts instantly.',
    image: require('../assets/images/alert1.jpg'), // Replace with your actual image path
  },
];

export default function IntroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient Effect */}
      <View style={styles.background}>
        <View style={[styles.gradientCircle, styles.circle1]} />
        <View style={[styles.gradientCircle, styles.circle2]} />
        <View style={[styles.gradientCircle, styles.circle3]} />
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, currentIndex === slides.length - 1 && styles.getStartedButton]} 
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.2,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: '#6366F1',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: '#8B5CF6',
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: '#EC4899',
    top: '40%',
    right: '20%',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: '90%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#A5B4FC',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#818CF8',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: '#4B5563',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButton: {
    backgroundColor: '#10B981',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  skipButtonText: {
    color: '#A5B4FC',
    fontSize: 16,
  },
});