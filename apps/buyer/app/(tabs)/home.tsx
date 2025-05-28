import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { t } from 'i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

const { width } = Dimensions.get('window');

export default function Home() {
  const [showButtonTooltip, setShowButtonTooltip] = useState(false);
  const router = useRouter();

  const buttonRef = useRef(null); 

  // funkcija za pokretanje walkthrougha
  const startWalkthrough = () => {
    setShowButtonTooltip(true);
  };

  // funkcija za zatvaranje tooltipa
  const closeWalkthrough = () => {
    setShowButtonTooltip(false);
  };

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={startWalkthrough} 
      >
        <Ionicons name="help-circle-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Animated Title */}
      <Animated.Text style={[styles.title, { opacity: fade, transform: [{ scale }] }]}>
        🎉 {t('welcome')}
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: fade }]}>
        {t('home-text')}
      </Animated.Text>

      {/* Animated CTA */}
      <Tooltip
        isVisible={showButtonTooltip}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_start_shopping_button')}
            </Text>
            {/*dugme "Završi" unutar tooltipa */}
            <TouchableOpacity
              style={styles.tooltipCloseButton}
              onPress={closeWalkthrough}
            >
              <Text style={styles.tooltipCloseButtonText}>
                {t('finish')}
              </Text>
            </TouchableOpacity>
          </View>
        }
        placement="top"
        onClose={closeWalkthrough} 
        tooltipStyle={{ width: width * 0.7 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
      >
        <Animated.View
          style={{ opacity: fade, marginTop: 30 }}
          ref={buttonRef} 
        >
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push('/stores')}
          >
            <Text style={styles.buttonText}>Pocni sa kupovinom</Text>
          </TouchableOpacity>
        </Animated.View>
      </Tooltip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4E8D7C',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4E8D7C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  // Novi stilovi za tooltip sadržaj i dugme
  tooltipContent: {
    alignItems: 'center', // Centriraj sadržaj unutar tooltipa
    padding: 5,
  },
  tooltipCloseButton: {
    marginTop: 10,
    backgroundColor: '#4E8D7C', // Boja dugmeta
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tooltipCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});