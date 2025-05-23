import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import DropDownPicker from 'react-native-dropdown-picker';
import * as SecureStore from 'expo-secure-store';

// Importuj tipove i API funkcije sa ispravnih lokacija
import { ProductLoyaltySetting, LoyaltyReportData, PointRateOption } from "../types/LoyaltyTypes"; 
import {
  apiFetchSellerProductsWithLoyalty,
  apiUpdateProductPointRate,
  apiFetchLoyaltyReport
} from "../api/loyaltyApi"; 


const POINT_RATE_OPTIONS: PointRateOption[] = [
  { label: "Bez Poena (0x)", value: 0 },
  { label: "Standardni (1x)", value: 1 },
  { label: "Dupli Poeni (2x)", value: 2 },
  { label: "Trostruki Poeni (3x)", value: 3 },
];

export default function LoyaltyScreen() {
  const { t } = useTranslation();

  const [storeId, setStoreId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<LoyaltyReportData | null>(null);
  const [productsLoyalty, setProductsLoyalty] = useState<ProductLoyaltySetting[]>([]);
  const [initialProductRates, setInitialProductRates] = useState<Record<number, number>>({});

  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

  // useCallback sada sadrži internu async funkciju
  const loadScreenData = useCallback(() => {
    const fetchData = async () => { // Definiši async funkciju unutra
      setLoadingReport(true);
      setLoadingProducts(true);
      const storedStoreIdString = await SecureStore.getItemAsync("storeId");

      if (storedStoreIdString) {
        const id = parseInt(storedStoreIdString, 10);
        setStoreId(id);
        try {
          const [fetchedReport, fetchedProducts] = await Promise.all([
            apiFetchLoyaltyReport(id),
            apiFetchSellerProductsWithLoyalty(id)
          ]);

          // Provjera tipa prije postavljanja reportData
          // Ako apiFetchLoyaltyReport ima ispravan Promise<LoyaltyReportData> tip, ovo je dovoljno:
          setReportData(fetchedReport);

          setProductsLoyalty(fetchedProducts);

          const initialRates: Record<number, number> = {};
          fetchedProducts.forEach(p => { initialRates[p.id] = p.currentPointRateFactor; });
          setInitialProductRates(initialRates);

        } catch (err) {
          console.error("Failed to fetch loyalty screen data", err);
          Alert.alert(t("error"), t("failed_to_load_loyalty_data"));
        }
      } else {
        Alert.alert(t("error"), t("store_id_not_found_seller"));
        setProductsLoyalty([]);
        setReportData(null);
      }
      setLoadingReport(false);
      setLoadingProducts(false);
    };

    fetchData(); 
  }, [t]); 

  useFocusEffect(loadScreenData);

  const handlePointRateFactorChange = (productId: number, newFactor: number | null) => {
    if (newFactor === null) return;
    setProductsLoyalty(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, currentPointRateFactor: newFactor } : p
      )
    );
  };

  const handleSaveChanges = async () => {
    if (storeId === null) {
      Alert.alert(t("error"), t("store_id_not_found_seller"));
      return;
    }
    setIsSubmitting(true);
    const failures: { name: string; error?: string }[] = [];
    let successes = 0;
    let changesMade = 0;

    for (const productSetting of productsLoyalty) {
      if (initialProductRates[productSetting.id] !== productSetting.currentPointRateFactor) {
        changesMade++;
        try {
          const updatedProduct = await apiUpdateProductPointRate(
            productSetting.id,
            storeId,
            productSetting.currentPointRateFactor
          );
          if (updatedProduct) {
            successes++;
            setInitialProductRates(prev => ({...prev, [updatedProduct.id]: updatedProduct.currentPointRateFactor}));
          } else {
            failures.push({ name: productSetting.name });
          }
        } catch (error: any) {
          console.error(`Failed to update product ${productSetting.name}:`, error);
          failures.push({ name: productSetting.name, error: error.message });
        }
      }
    }

    setIsSubmitting(false);
    if (changesMade === 0) {
        Alert.alert(t("info"), t("no_changes_to_save"));
    } else if (failures.length === 0 && successes > 0) {
      Alert.alert(t("success"), t("loyalty_settings_updated_all"));
    } else if (failures.length > 0 && successes > 0) {
       Alert.alert(t("partial_success"), `${t("loyalty_settings_updated_some")}. ${t("failed_for")}: ${failures.map(f => f.name).join(', ')}`);
    } else if (failures.length > 0 && successes === 0) {
      Alert.alert(t("error"), t("loyalty_settings_update_failed_all"));
    }
  };

  const renderProductLoyaltyItem = ({ item, index }: { item: ProductLoyaltySetting, index: number }) => {
    const isDropdownOpen = openDropdowns[item.id] || false;
    const zIndexValue = (productsLoyalty.length - index) * 100;

    return (
      <View style={[styles.productItemContainer, { zIndex: isDropdownOpen ? 5001 : zIndexValue }]}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.productImage} />}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        </View>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={isDropdownOpen}
            value={item.currentPointRateFactor}
            items={POINT_RATE_OPTIONS}
            setOpen={() => {
                setOpenDropdowns(prev => {
                    const newState = !prev[item.id];
                    const allClosed: Record<number,boolean> = {};
                    productsLoyalty.forEach(p => allClosed[p.id] = false);
                    return { ...allClosed, [item.id]: newState };
                });
            }}
            setValue={(callback) => {
              const value = (callback as (value: any) => any)(item.currentPointRateFactor);
              handlePointRateFactorChange(item.id, value as number | null);
            }}
            setItems={() => {}}
            placeholder={t('select_rate')}
            listMode="SCROLLVIEW"
            style={styles.dropdownStyle}
            containerStyle={styles.dropdownContainerStyle}
            dropDownContainerStyle={styles.dropDownPickerContainerStyle}
            listItemLabelStyle={styles.dropdownListItemLabel}
            zIndex={isDropdownOpen ? 5000 : zIndexValue}
          />
        </View>
      </View>
    );
  };

  if (loadingReport || loadingProducts) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }} >
        {reportData && (
            <View style={styles.summaryContainer}>
            <Text style={styles.title}>{t('Loyalty Program Report')}</Text>
            <View style={styles.reportCardContainer}>
                <View style={styles.reportCard}><Text style={styles.reportLabel}>Total Store Income</Text><Text style={styles.reportValue}>${reportData.totalIncome.toLocaleString()}</Text></View>
                <View style={styles.reportCard}><Text style={styles.reportLabel}>Paid to Admin (Points)</Text><Text style={styles.reportValue}>${reportData.paidToAdmin.toFixed(2)}</Text></View>
                <View style={styles.reportCard}><Text style={styles.reportLabel}>Bought with Points</Text><Text style={styles.reportValue}>${reportData.redeemedWithPoints.toFixed(2)}</Text></View>
            </View>
            </View>
        )}

        <View style={styles.productListSection}>
          <Text style={styles.title}>{t('Product Point Rates Management')}</Text>
          {productsLoyalty.length > 0 ? (
            <FlatList
              data={productsLoyalty}
              renderItem={renderProductLoyaltyItem}
              keyExtractor={item => item.id.toString()}
              style={styles.productList}
              // scrollEnabled={false} // Možeš probati i bez ovoga ako FlatList nije predugačak
                                      // ili ako report sekcija nije prevelika.
                                      // Ako je FlatList glavni skrolabilni element, onda ScrollView nije potreban oko svega.
              ListFooterComponentStyle={{paddingBottom: 70}} // Prostor za dugme ako je dugme fiksirano
            />
          ) : (
            !loadingProducts && <Text style={styles.noProductsText}>{t('No products found to configure loyalty points.')}</Text>
          )}
        </View>
      </ScrollView>
      {}
       {productsLoyalty.length > 0 && !loadingProducts && (
            <View style={styles.saveButtonFixedContainer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                    onPress={handleSaveChanges}
                    disabled={isSubmitting}
                >
                    <Text style={styles.saveButtonText}>
                        {isSubmitting ? t('saving_changes') : t('save_all_changes')}
                    </Text>
                </TouchableOpacity>
            </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16, color: "#333", paddingHorizontal: 16, paddingTop:10 },

  summaryContainer: { paddingBottom: 16, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "#e0e0e0", marginBottom: 10 },
  reportCardContainer: { gap: 12, paddingHorizontal: 16 },
  reportCard: { backgroundColor: "#f9f9f9", padding: 16, borderRadius: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  reportLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  reportValue: { fontSize: 18, fontWeight: "bold", color: "#222" },

  productListSection: { flex: 1, backgroundColor: "#ffffff", },
  productList: { flexGrow: 1 },
  productItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    minHeight: 70,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center', marginRight: 10 },
  productName: { fontSize: 15, fontWeight: "500", color: "#333" },
  dropdownContainer: { width: 160, },
  dropdownStyle: { backgroundColor: '#fafafa', borderColor: '#ddd', minHeight: 40 },
  dropdownContainerStyle: { /* ... */ },
  dropDownPickerContainerStyle: { borderColor: '#ddd' },
  dropdownListItemLabel: { fontSize: 14, color: '#444' },
  noProductsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#777', paddingHorizontal: 16 },

  saveButtonFixedContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white', 
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    elevation: 2,
  },
  saveButtonDisabled: { backgroundColor: '#cccccc' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});