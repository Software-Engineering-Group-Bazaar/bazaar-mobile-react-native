import { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import InputField from "@/components/ui/input/InputField";
import SubmitButton from "@/components/ui/input/SubmitButton";
import DropdownPicker from "@/components/ui/input/DropdownPicker";
import {
  apiFetchAllCategoriesAsync,
  apiCreateNewStoreAsync,
  apiGetRegionsAsync,
  apiGetPlacesAsync, // New function for places
} from "../api/storeApi";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

export default function PostavkeProdavnice() {
  const { t } = useTranslation();
  const router = useRouter();

  // Store Info
  const [name, setName] = useState("");
  const [streetAndNumber, setStreetAndNumber] = useState("");
  const [description, setDescription] = useState("");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openRegion, setOpenRegion] = useState(false);
  const [openPlace, setOpenPlace] = useState(false);

  // Dropdown Selections
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // Dropdown Data
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: number }[]
  >([]);
  const [regions, setRegions] = useState<{ label: string; value: number }[]>(
    []
  );
  const [places, setPlaces] = useState<{ label: string; value: number }[]>([]);

  // Fetch Initial Data
  useEffect(() => {
    async function fetchCategories() {
      const categories = await apiFetchAllCategoriesAsync();
      setCategoryItems(categories);
    }

    async function fetchRegions() {
      const data = await apiGetRegionsAsync();
      setRegions(
        data.map((region: { id: number; name: string }) => ({
          label: region.name,
          value: region.id,
        }))
      );
    }

    fetchCategories();
    fetchRegions();
  }, []);

  // Fetch Places when Region Changes
  useEffect(() => {
    async function fetchPlaces() {
      if (!selectedRegionId) return;
      const data = await apiGetPlacesAsync(selectedRegionId);
      setPlaces(
        data.map((place: { id: number; name: string }) => ({
          label: place.name,
          value: place.id,
        }))
      );
    }

    fetchPlaces();
  }, [selectedRegionId]);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !streetAndNumber.trim() ||
      !selectedRegionId ||
      !selectedPlaceId ||
      !description.trim() ||
      selectedCategoryId == null
    ) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        categoryId: selectedCategoryId,
        address: streetAndNumber.trim(),
        description: description.trim(),
        placeId: selectedPlaceId,
      };
      const response = await apiCreateNewStoreAsync(payload);
      response && router.replace("../(tabs)/pregled_prodavnica");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <HelpAndLanguageButton showHelpButton={false} />
      <View style={styles.container}>
        <Text style={styles.title}>{t("store_settings")}</Text>

        <InputField
          icon="store"
          placeholder={t("store_name")}
          value={name}
          onChangeText={setName}
        />
        <InputField
          icon="map-marker"
          placeholder={t("street_and_number")}
          value={streetAndNumber}
          onChangeText={setStreetAndNumber}
        />

        {/* Region Dropdown */}
        <View style={styles.dropdownWrapperTopTop}>
          <DropdownPicker
            open={openRegion}
            value={selectedRegionId}
            items={regions}
            setOpen={setOpenRegion}
            setValue={setSelectedRegionId}
            setItems={setRegions}
            placeholder={t("select_region")}
          />
        </View>

        {/* Place Dropdown */}
        <View style={styles.dropdownWrapperTop}>
          <DropdownPicker
            open={openPlace}
            value={selectedPlaceId}
            items={places}
            setOpen={setOpenPlace}
            setValue={setSelectedPlaceId}
            setItems={setPlaces}
            placeholder={t("select_place")}
          />
        </View>

        {/* Category Dropdown */}
        <View style={styles.dropdownWrapperBottom}>
          <DropdownPicker
            open={openCategory}
            value={selectedCategoryId}
            items={categoryItems}
            setOpen={setOpenCategory}
            setValue={setSelectedCategoryId}
            setItems={setCategoryItems}
            placeholder={t("select_category")}
          />
        </View>

        <InputField
          icon="align-left"
          placeholder={t("description")}
          value={description}
          onChangeText={setDescription}
        />
        <SubmitButton
          onPress={handleSave}
          disabled={loading}
          icon="file"
          buttonText={t("save_changes")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 100, alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4E8D7C",
    textAlign: "center",
    marginBottom: 30,
  },
  dropdownWrapperTopTop: {
    zIndex: 3000,
    position: "relative",
    width: "100%",
    marginBottom: 16,
  },
  dropdownWrapperTop: {
    zIndex: 2000,
    position: "relative",
    width: "100%",
    marginBottom: 16,
  },
  dropdownWrapperBottom: {
    zIndex: 1000,
    position: "relative",
    width: "100%",
    marginBottom: 16,
  },
});
