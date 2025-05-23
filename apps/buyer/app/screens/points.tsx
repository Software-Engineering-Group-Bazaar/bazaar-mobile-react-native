import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
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

  const DUMMY_POINTS = 120;
  const DUMMY_RATE = 0.25;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (USE_DUMMY_DATA) {
          await new Promise(res => setTimeout(res, 800));
          setPoints(DUMMY_POINTS);
          setRate(DUMMY_RATE);
        } else {
          const token = await SecureStore.getItemAsync('auth_token');
          const ptsRes = await fetch(`${baseURL}/api/Loyalty/users/points/my`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!ptsRes.ok) throw new Error(`Points ${ptsRes.status}`);
          const ptsData = await ptsRes.text();

          const rateRes = await fetch(`${baseURL}/api/Loyalty/consts/spending`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!rateRes.ok) throw new Error(`Rate ${rateRes.status}`);
          const rateData = await rateRes.text();

          setPoints(Number(ptsData));
          setRate(Number(rateData));
        }
      } catch (err) {
        console.error('Error loading points:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const valueInMoney = (points * rate).toFixed(2);

return (
    <>
      <CustomHeader />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="wallet-outline" size={28} color="#4e8d7c" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4e8d7c" />
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="star" size={28} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.pointsText}>
                    {t('points_count')} {points}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.moneyCard}>
              <Text style={styles.moneyLabel}>{t('points_value')}</Text>
              <Text style={styles.moneyValue}>{valueInMoney} KM</Text>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  pointsText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  moneyCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyLabel: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  moneyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#047857',
    marginTop: 4,
  },
});