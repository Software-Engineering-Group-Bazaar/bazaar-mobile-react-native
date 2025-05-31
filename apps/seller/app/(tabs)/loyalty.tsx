import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ScrollView,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import DropDownPicker from "react-native-dropdown-picker";
import * as SecureStore from "expo-secure-store";
import {
  CopilotStep,
  walkthroughable,
  useCopilot,
  CopilotProvider,
} from "react-native-copilot";

const WalkthroughableView = walkthroughable(View);

import {
  ProductLoyaltySetting,
  LoyaltyReportData,
  PointRateOption,
} from "../types/loyaltyTypes";
import {
  apiFetchSellerProductsWithLoyalty,
  apiUpdateProductPointRate,
  apiFetchLoyaltyReport,
} from "../api/loyaltyApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

const getPointRateOptions = (
  t: (key: string, options?: any) => string
): PointRateOption[] => [
  { label: t("no_points_label"), value: 0 },
  { label: t("standard_label"), value: 1 },
  { label: t("double_points_label"), value: 2 },
  { label: t("triple_points_label"), value: 3 },
];

function LoyaltyScreen() {
  const { t } = useTranslation();
  const POINT_RATE_OPTIONS = getPointRateOptions(t);

  const [storeId, setStoreId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<LoyaltyReportData | null>(null);
  const [productsLoyalty, setProductsLoyalty] = useState<
    ProductLoyaltySetting[]
  >([]);
  const [initialProductRates, setInitialProductRates] = useState<
    Record<number, number>
  >({});

  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {}
  );
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const WalkthroughableView = walkthroughable(View);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScreenData(); // reuse your existing data fetch function
    setRefreshing(false);
  };

  const fetchReportForPeriod = async () => {
    if (fromDate > toDate) {
      Alert.alert(
        t("error"),
        t("Error: The start date cannot be after the end date.")
      );
      return;
    }
    const storedStoreIdString = await SecureStore.getItemAsync("storeId");

    if (storedStoreIdString) {
      const id = parseInt(storedStoreIdString, 10);
      setStoreId(id);
      const fetchedReport = await Promise.all([
        apiFetchLoyaltyReport(
          id,
          String(fromDate.toISOString().split(".")[0]),
          String(toDate.toISOString().split(".")[0])
        ),
      ]);
      setReportData((fetchedReport as unknown[])[0] as LoyaltyReportData);
    }
  };

  const loadScreenData = useCallback(() => {
    const fetchData = async () => {
      setLoadingReport(true);
      setLoadingProducts(true);
      const storedStoreIdString = await SecureStore.getItemAsync("storeId");

      if (storedStoreIdString) {
        const id = parseInt(storedStoreIdString, 10);
        setStoreId(id);
        try {
          const [fetchedReport, fetchedProducts] = await Promise.all([
            apiFetchLoyaltyReport(
              id,
              "0001-01-01T00:00:00",
              "2025-12-01T00:00:00"
            ),
            apiFetchSellerProductsWithLoyalty(id),
          ]);

          setReportData(fetchedReport as LoyaltyReportData);
          setProductsLoyalty(fetchedProducts);

          const initialRates: Record<number, number> = {};
          fetchedProducts.forEach((p) => {
            initialRates[p.id] = p.currentPointRateFactor;
          });
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

  const handlePointRateFactorChange = (
    productId: number,
    newFactor: number | null
  ) => {
    if (newFactor === null) return;
    setProductsLoyalty((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, currentPointRateFactor: newFactor } : p
      )
    );
  };

  const handleSaveChanges = async () => {
    if (storeId === null) {
      Alert.alert(t("error"), t("store_id_not_found_seller_for_save"));
      return;
    }
    setIsSubmitting(true);
    const failures: { name: string; error?: string }[] = [];
    let successes = 0;
    let changesMade = 0;

    for (const productSetting of productsLoyalty) {
      if (
        initialProductRates[productSetting.id] !==
        productSetting.currentPointRateFactor
      ) {
        changesMade++;
        try {
          const successUpdating = await apiUpdateProductPointRate(
            productSetting.id,
            productSetting.currentPointRateFactor
          );

          if (successUpdating) {
            successes++;

            setInitialProductRates((prev) => ({
              ...prev,
              [productSetting.id]: productSetting.currentPointRateFactor,
            }));
          } else {
            failures.push({
              name: productSetting.name,
              error: t("update_failed_no_details"),
            });
          }
        } catch (error: any) {
          console.error(
            `Failed to update product ${productSetting.name}:`,
            error
          );
          failures.push({
            name: productSetting.name,
            error: error.message || t("unknown_error"),
          });
        }
      }
    }

    setIsSubmitting(false);
    if (changesMade === 0) {
      Alert.alert(t("info"), t("no_changes_to_save"));
    } else if (failures.length === 0 && successes > 0) {
      Alert.alert(t("success"), t("loyalty_settings_updated_all"));
    } else if (failures.length > 0 && successes > 0) {
      Alert.alert(
        t("partial_success"),
        `${t("loyalty_settings_updated_some")}. ${t("failed_for")}: ${failures
          .map((f) => f.name)
          .join(", ")}`
      );
    } else if (failures.length > 0 && successes === 0) {
      Alert.alert(t("error"), t("loyalty_settings_update_failed_all"));
    }
  };

  const renderProductLoyaltyItem = ({
    item,
    index,
  }: {
    item: ProductLoyaltySetting;
    index: number;
  }) => {
    const isDropdownOpen = openDropdowns[item.id] || false;
    const zIndexValue = (productsLoyalty.length - index) * 100;
    const isLastFewItems = index >= productsLoyalty.length - 2;
    if (productsLoyalty.length == 3) {
      const isLastFewItems = index >= productsLoyalty.length - 1;
    }

    const itemContent = (
      <View
        style={[
          styles.productItemContainer,
          { zIndex: isDropdownOpen ? 5001 : zIndexValue },
        ]}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={isDropdownOpen}
            value={item.currentPointRateFactor}
            modalTitle={t("select_rate_for", { productName: item.name })}
            items={POINT_RATE_OPTIONS}
            dropDownDirection={isLastFewItems ? "TOP" : "AUTO"}
            setOpen={() => {
              setOpenDropdowns((prev) => {
                const newState = !prev[item.id];
                const allClosed: Record<number, boolean> = {};
                productsLoyalty.forEach((p) => (allClosed[p.id] = false));
                return { ...allClosed, [item.id]: newState };
              });
            }}
            setValue={(callback) => {
              const value = (callback as (value: any) => any)(
                item.currentPointRateFactor
              );
              handlePointRateFactorChange(item.id, value as number | null);
            }}
            setItems={() => {}}
            placeholder={t("select_rate")}
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

    if (index === 0) {
      return (
        <CopilotStep
          text={t("edit_points")}
          order={5}
          name="edit-points"
        >
          <WalkthroughableView>{itemContent}</WalkthroughableView>
        </CopilotStep>
      );
    }

    return itemContent;
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
      <HelpAndLanguageButton />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 📅 Period Selection Section */}
        <Text style={styles.title}>{t("Loyalty Program Report")}</Text>
        <CopilotStep
          text={t("date_picker_loyalty")}
          order={1}
          name="date_range_selector"
        >
          <WalkthroughableView style={styles.dateRow}>
            <View style={styles.dateFilterContainer}>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  onPress={() => setShowFromPicker(true)}
                  style={styles.dateButton}
                >
                  <Text>{fromDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <Text style={styles.toLabel}>to</Text>

                <TouchableOpacity
                  onPress={() => setShowToPicker(true)}
                  style={styles.dateButton}
                >
                  <Text>{toDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inlineApplyFilterButton}
                  onPress={fetchReportForPeriod}
                >
                  <Text style={styles.inlineApplyFilterText}>
                    {t("Apply Filter")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </WalkthroughableView> 
        </CopilotStep>
        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowFromPicker(false);
              if (selectedDate) setFromDate(selectedDate);
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowToPicker(false);
              if (selectedDate) setToDate(selectedDate);
            }}
          />
        )}

        {reportData && (
          <View style={styles.summaryContainer}>
            {/* Store Income Section */}
            <View style={styles.sectionContainer}>
              {/* ⬜ Store Performance Section */}
              <CopilotStep
                text={t("Store Performance Report")}
                order={2}
                name="store_performance"
              >
                <WalkthroughableView style={{ width: "100%" }}>
                  <View style={styles.reportSection}>
                    <Text style={styles.sectionTitle}>
                      {t("Store Performance")}
                    </Text>
                    <View style={styles.reportCard}>
                      <Text style={styles.reportLabel}>
                        💰 {t("Total Store Income")}
                      </Text>
                      <Text style={styles.reportValue}>
                        {reportData.totalIncome.toLocaleString()} KM
                      </Text>
                    </View>
                  </View>
                </WalkthroughableView>
              </CopilotStep>
              {/* 🔻 Point Expenditure Section */}
              <CopilotStep
                text={t("Generated Points Report")}
                order={3}
                name="generated_points"
              >
                <WalkthroughableView style={{ width: "100%" }}>
                  <View style={[styles.reportSection, styles.redBorder]}>
                    <Text style={styles.sectionTitle}>
                      {t("Point Expenditure")}
                    </Text>

                    <View style={styles.reportCard}>
                      <Text style={styles.reportLabel}>
                        🎟️ {t("Points Given to Buyers")}
                      </Text>
                      <Text style={styles.reportValue}>
                        {reportData.pointsGiven.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.reportCard}>
                      <Text style={styles.reportLabel}>
                        💸 {t("Paid for Points")}
                      </Text>
                      <Text style={styles.reportValue}>
                        {reportData.paidToAdmin.toFixed(2)} KM
                      </Text>
                    </View>
                  </View>
                </WalkthroughableView>
              </CopilotStep>

              {/* 🟢 Point Income Section */}
              <CopilotStep
                text={t("Point Income Report")}
                order={4}
                name="point_income"
              >
                <WalkthroughableView style={{ width: "100%" }}>
                  <View style={[styles.reportSection, styles.greenBorder]}>
                    <Text style={styles.sectionTitle}>{t("Point Income")}</Text>

                    <View style={styles.reportCard}>
                      <Text style={styles.reportLabel}>
                        🔄 {t("Points Used in Orders")}
                      </Text>
                      <Text style={styles.reportValue}>
                        {reportData.pointsUsed.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.reportCard}>
                      <Text style={styles.reportLabel}>
                        💵 {t("Compensation for Used Points")}
                      </Text>
                      <Text style={styles.reportValue}>
                        {reportData.compensatedAmount.toFixed(2)} KM
                      </Text>
                    </View>
                  </View>
                </WalkthroughableView>
              </CopilotStep>
            </View>
          </View>
        )}

        <View style={styles.productListSection}>
          <Text style={styles.title}>
            {t("Product Point Rates Management")}
          </Text>
          {productsLoyalty.length > 0 ? (
            <FlatList
              data={productsLoyalty}
              renderItem={renderProductLoyaltyItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.productList}
              scrollEnabled={false}
              ListFooterComponentStyle={{ paddingBottom: 70 }}
            />
          ) : (
            !loadingProducts && (
              <Text style={styles.noProductsText}>
                {t("No products found to configure loyalty points.")}
              </Text>
            )
          )}
        </View>
        {productsLoyalty.length > 0 && !loadingProducts && (
          <TouchableOpacity
            style={[
              styles.applyFilterButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveChanges}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? t("saving_changes") : t("Save Changes")}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function LoyaltyScreenContent() {
  const { t } = useTranslation();
  return (
    <CopilotProvider
      labels={{
        finish: t("Finish"),
        next: t("Next"),
        skip: t("Skip"),
        previous: t("Previous")
      }}>
      <LoyaltyScreen />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    paddingHorizontal: 16,
    paddingTop: 17,
  },

  productListSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
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
  productInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
    minHeight: 40,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
    height: 40,
  },
  dropdownContainer: { width: 160, justifyContent: "center" },
  dropdownStyle: {
    backgroundColor: "#fafafa",
    borderColor: "#ddd",
    minHeight: 40,
  },
  dropdownContainerStyle: {
    /* ... */
  },
  dropDownPickerContainerStyle: { borderColor: "#ddd" },
  dropdownListItemLabel: { fontSize: 14, color: "#444" },
  noProductsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
    paddingHorizontal: 16,
  },
  sectionContainer: {
    padding: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  reportSection: {
    borderRadius: 3,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  redBorder: {
    borderLeftWidth: 5,
    borderLeftColor: "#ff4d4d",
    backgroundColor: "#fff5f5",
  },
  applyFilterButton: {
    backgroundColor: "#4E8D7C",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center", // center horizontally
    marginTop: 10,
  },
  applyFilterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  greenBorder: {
    borderLeftWidth: 5,
    borderLeftColor: "#28a745",
    backgroundColor: "#f5fff5",
  },
  reportCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  reportLabel: {
    fontSize: 16,
  },
  reportValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonFixedContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4E8D7C",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    elevation: 2,
  },
  saveButtonDisabled: { backgroundColor: "#cccccc" },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  summaryContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingTop: 15,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  dateFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // or 'flex-start' if you want tighter grouping
    flexWrap: "wrap", // ensures it doesn't overflow
    gap: 8, // RN 0.71+ supports gap
    marginBottom: 10,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  toLabel: {
    marginHorizontal: 6,
    fontSize: 16,
  },
  inlineApplyFilterButton: {
    backgroundColor: "#4E8D7C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  inlineApplyFilterText: {
    color: "white",
    fontWeight: "bold",
  },
});
