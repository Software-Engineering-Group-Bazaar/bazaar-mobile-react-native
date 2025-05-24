import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView, // Dodano za bolji scroll
} from 'react-native';
import CustomHeader from 'proba-package/custom-header/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

export default function PointsScreen() {
  const { t } = useTranslation();

  const [points, setPoints] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 

  const DUMMY_POINTS = 120;
  const DUMMY_RATE = 0.25;

  useEffect(() => {
    const loadData = async () => {
      setError(null); 
      try {
        if (USE_DUMMY_DATA) {
          await new Promise(res => setTimeout(res, 800));
          setPoints(DUMMY_POINTS);
          setRate(DUMMY_RATE);
        } else {
          const token = await SecureStore.getItemAsync('auth_token');
          if (!token) {
            throw new Error('Authentication token not found.');
          }

          const ptsRes = await fetch(`${baseURL}/api/Loyalty/users/points/my`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!ptsRes.ok) throw new Error(`Failed to fetch points: ${ptsRes.status}`);
          const ptsData = await ptsRes.text();

          const rateRes = await fetch(`${baseURL}/api/Loyalty/consts/spending`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!rateRes.ok) throw new Error(`Failed to fetch rate: ${rateRes.status}`);
          const rateData = await rateRes.text();

          setPoints(Number(ptsData));
          setRate(Number(rateData));
        }
      } catch (err) {
        console.error('Error loading points:', err);
        setError(t('error_loading_data')); 
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]); 

  const valueInMoney = (points * rate).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2A9D8F" />
            <Text style={styles.loadingText}>{t('loading_data')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorTextSmall}>{t('try_again_later')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconContainer, styles.pointsIconBg]}>
                  <Ionicons name="star" size={28} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.cardLabel}>{t('points_count')}</Text>
                  <Text style={styles.pointsValue}>{points}</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                {t('points_info_text')}
              </Text>
            </View>

            <View style={[styles.card, styles.moneyCard]}>
              <View style={styles.cardRow}>
                <View style={[styles.iconContainer, styles.moneyIconBg]}>
                  <Ionicons name="cash-outline" size={28} color="#059669" />
                </View>
                <View>
                  <Text style={styles.cardLabel}>{t('points_value_in_money')}</Text>
                  <Text style={styles.moneyValue}>{valueInMoney} KM</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                {t('money_value_info_text')}
              </Text>
            </View>

            {/* sekcija za objašnjenje bodova */}
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>{t('how_points_work')}</Text>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{t('points_explanation_1')}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{t('points_explanation_2', { rate: (rate * 100).toFixed(0) })}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10, 
    elevation: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, 
  },
  iconContainer: {
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsIconBg: {
    backgroundColor: '#FFEFD5',
  },
  moneyIconBg: {
    backgroundColor: '#D1FAE5', 
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  pointsValue: {
    fontSize: 32, 
    fontWeight: '800', 
    color: '#D97706',
    marginTop: 4,
  },
  moneyValue: {
    fontSize: 32, 
    fontWeight: '800', 
    color: '#059669',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20, 
  },
  moneyCard: {
    backgroundColor: '#F0FDF4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
  },
  errorTextSmall: {
    marginTop: 8,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#E0F2F7', 
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#38BDF8', 
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4B5563',
    flexShrink: 1, 
    lineHeight: 20,
  },
});