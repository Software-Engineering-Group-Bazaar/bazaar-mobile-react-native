// File: app/(CRUD)/pregled_reviews.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Text,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiFetchStoreReviews } from "../api/reviewApi";
import { Review } from "../types/review";
import ReviewCard from "@/components/ui/cards/ReviewCard";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

import {
  CopilotProvider,
  CopilotStep,
  walkthroughable,
} from "react-native-copilot";

const { height } = Dimensions.get("window");
const WalkthroughableView = walkthroughable(View);

function StoreReviewsScreenContent() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const storeId = params.storeId ? Number(params.storeId) : null;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Postavi generički naslov za ekran s recenzijama
    navigation.setOptions({ title: t("store_reviews_title") || "Recenzije prodavnice" });
  }, [navigation, t]);

  const fetchReviews = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const fetchedReviews = await apiFetchStoreReviews(storeId);
      fetchedReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleResponseSubmitted = (updatedReview: Review) => {
    setReviews((prevReviews) =>
      prevReviews.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredLoader}>
        {/* Ne prikazujemo HelpAndLanguageButton dok se učitava */}
        <ActivityIndicator size="large" color="#4E8D7C" />
      </View>
    );
  }

  if (!storeId) {
    return (
      <View style={styles.centeredLoader}>
        {/* Ne prikazujemo HelpAndLanguageButton ako postoji greška */}
        <Text style={styles.errorText}>{t("store_id_missing")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HelpAndLanguageButton showLanguageButton={true} showHelpButton={true} />
      <FlatList
        data={reviews}
        renderItem={({ item, index }) => (
          index === 0 ? (
            <CopilotStep
              text={t("help_pregled_reviews_card") || "Ovo je prikaz jedne recenzije. Možete pročitati komentar i odgovoriti na njega."}
              order={1}
              name="firstReviewCard"
            >
              <WalkthroughableView>
                <ReviewCard
                  review={item}
                  onResponseSubmitted={handleResponseSubmitted}
                />
              </WalkthroughableView>
            </CopilotStep>
          ) : (
            <ReviewCard
              review={item}
              onResponseSubmitted={handleResponseSubmitted}
            />
          )
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.scrollWrapper}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<View style={{ height: height * 0.08 }} />}
        ListEmptyComponent={
          !loading ? (
            <CopilotStep
              text={t("help_pregled_reviews_no_reviews") || "Ako nema recenzija za vašu prodavnicu, prikazat će se ova poruka."}
              order={1}
              name="noReviewsMessage"
            >
              <WalkthroughableView>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t("no_reviews_yet")}</Text>
                </View>
              </WalkthroughableView>
            </CopilotStep>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4E8D7C"]}
            tintColor={"#4E8D7C"}
          />
        }
      />
    </View>
  );
}

export default function StoreReviewsScreen() {
  const { t } = useTranslation();
  return (
    <CopilotProvider
      labels={{
        finish: t("Finish") || "Završi",
        next: t("Next") || "Dalje",
        skip: t("Skip") || "Preskoči",
        previous: t("Previous") || "Nazad",
      }}
      overlay="svg"
      animated
    >
      <StoreReviewsScreenContent />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: height * 0.1,
    flexGrow: 1,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4E8D7C",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
  },
});