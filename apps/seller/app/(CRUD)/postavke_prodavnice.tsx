import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  apiFetchAllCategoriesAsync,
  apiCreateNewStoreAsync,
  apiGetRegionsAsync,
} from "../api/storeApi";
import { useRouter } from "expo-router";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import SetHeaderRight from '../../components/ui/NavHeader';
import InputField from "@/components/ui/input/InputField";
import SubmitButton from "@/components/ui/input/SubmitButton";
import DropdownPicker from "@/components/ui/input/DropdownPicker";
import { FontAwesome5 } from "@expo/vector-icons";

export default function PostavkeProdavnice() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [streetAndNumber, setStreetAndNumber] = useState(""); // << DODANO
  const [city, setCity] = useState(""); // << DODANO
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: number }[]
  >([]);
  const [municipalityListOpen, setMunicipalityListOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<
    number | null
  >(null); // << DODANO
  const [municipalities, setMunicipalities] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    async function fetchCategories() {
      const categories = await apiFetchAllCategoriesAsync();
      setCategoryItems(categories);
    }

    const loadMunicipalities = async () => {
      try {
        const data = await apiGetRegionsAsync();
        const mapped = data.map((region) => ({
          label: region.name,
          value: region.id,
        }));
        setMunicipalities(mapped);
      } catch (error) {
        console.error("Failed to fetch regions", error);
      }
    };

    loadMunicipalities();
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !streetAndNumber.trim() ||
      !city.trim() ||
      !selectedMunicipality ||
      !description.trim()
      // !selectedCategoryId
    ) {
      console.log("Ime:", name.trim());
      console.log("Ulica i broj:", streetAndNumber.trim());
      console.log("Grad:", city.trim());
      console.log("Opština:", selectedMunicipality);
      console.log("Opis:", description.trim());
      console.log("Kategorija ID:", selectedCategoryId);
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        streetAndNumber: streetAndNumber.trim(), // Dodato novo polje
        city: city.trim(), //  Dodato novo polje
        municipality: selectedMunicipality, //  Dodato novo polje
        description: description.trim(),
        categoryId: selectedCategoryId,
      };
      const response = await apiCreateNewStoreAsync(payload);
      response && router.replace("../(tabs)/pregled_prodavnica");
    } catch (error) {
      console.error("Greška prilikom slanja zahtjeva:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <SetHeaderRight title="Postavke prodavnice" />
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      <View style={styles.container}>
        <Text style={styles.title}>{t("store_settings")}</Text>

        <InputField
          icon="store"
          placeholder={t("store_name")}
          value={name}
          onChangeText={setName}
        />

        {/* Input za Ulicu i Broj */}
        <InputField
          icon="map-marker"
          placeholder={t("street_and_number")}
          value={streetAndNumber}
          onChangeText={setStreetAndNumber}
        />

        {/* Input za Grad */}
        <InputField
          icon="city"
          placeholder={t("city")}
          value={city}
          onChangeText={setCity}
        />

        {/* Input za Opštinu */}
        {/* Ovaj View je lose rjesenje*/}
        <View style={{ zIndex: 2000 }}>
          <DropdownPicker
            open={municipalityListOpen}
            value={selectedMunicipality}
            items={municipalities}
            setOpen={setMunicipalityListOpen}
            setValue={setSelectedMunicipality}
            setItems={setMunicipalities}
            placeholder={t("municipality")}
          />
        </View>

        <View style={{ zIndex: 1000 }}>
          <DropdownPicker
            open={open}
            value={selectedCategoryId}
            items={categoryItems}
            setOpen={setOpen}
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4E8D7C",
    textAlign: "center",
    marginBottom: 30,
  },
});