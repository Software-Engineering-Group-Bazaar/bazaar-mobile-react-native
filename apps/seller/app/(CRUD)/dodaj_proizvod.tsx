import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../api/defaultApi";
//-------------------Route Explorer---------------------------------
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import InputField from "@/components/ui/input/InputField";
import SubmitButton from "@/components/ui/input/SubmitButton";
import ImagePreviewList from "@/components/ui/ImagePreviewList";
import DropdownPicker from "@/components/ui/input/DropdownPicker";
import SetHeaderRight from "../../components/ui/NavHeader";
import { apiFetchCategories } from "../api/productApi";

const weightUnits = ["kg", "g", "lbs"];
const volumeUnits = ["L", "ml", "oz"];

export default function AddProductScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const router = useRouter(); // Premesti ovde
  const storeId = params.storeId ? Number(params.storeId) : null; // Dodaj i storeId ovde
  // const isEditing = productId !== null;
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // Ovo će biti Maloprodajna
  const [wholesaleThreshold, setWholesaleThreshold] = useState(""); // NOVO: Prag
  const [wholesalePrice, setWholesalePrice] = useState(""); // NOVO: Veleprodajna
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightUnit, setWeightUnit] = useState(weightUnits[0]);
  const [weightItems, setWeightItems] = useState(
    weightUnits.map((unit) => ({ label: unit, value: unit }))
  );

  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeUnit, setVolumeUnit] = useState(volumeUnits[0]);
  const [volumeItems, setVolumeItems] = useState(
    volumeUnits.map((unit) => ({ label: unit, value: unit }))
  );

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<number | null>(null); // Inicijalizacija na null

  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [isActive, setIsActive] = useState(true);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await apiFetchCategories();
      const formattedCategories = data.map(
        (cat: { id: number; name: string }) => ({
          label: cat.name,
          value: cat.id,
        })
      );

      setCategories(formattedCategories);
      console.log("Fetched categories:", formattedCategories);
    };

    fetchCategories();
  }, []);

  // Postavljanje naslova ekrana dinamički (Dodaj/Uredi Proizvod)
  useEffect(() => {
    navigation.setOptions({
      title: t("add_a_product"),
    });
    // Ponovo izvrši ako se promeni mod (isEditing), jezik ili sama navigation instanca
  }, [navigation, i18n.language, t]);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !price.trim() ||
      category == null ||
      !wholesaleThreshold.trim() ||
      !wholesalePrice.trim()
    ) {
      Alert.alert(t("error"), t("fill_all_fields")); // Možda treba specifičnija poruka
      return;
    }
    const isWeightProvided = weight.trim() !== "";
    const isVolumeProvided = volume.trim() !== "";
    if (!isWeightProvided && !isVolumeProvided) {
      Alert.alert(t("error"), t("error_weight_or_volume_required"));
      return;
    }
    if (storeId == null) {
      console.error("Store ID missing for create.");
      Alert.alert(t("error"), t("something_went_wrong"));
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("Name", name);
    if (category != null) {
      // Provjeri da li je kategorija odabrana
      formData.append("ProductCategoryId", category.toString());
    }
    formData.append("RetailPrice", price.toString());
    if (wholesalePrice.trim()) {
      formData.append("WholesalePrice", wholesalePrice.trim()); //novo
    }
    if (wholesaleThreshold.trim()) {
      formData.append("WholesaleThreshold", wholesaleThreshold.trim()); //novo
    }
    if (weight.trim()) {
      formData.append("Weight", weight.trim());
      formData.append("WeightUnit", weightUnit);
    }
    if (volume.trim()) {
      formData.append("Volume", volume.trim());
      formData.append("VolumeUnit", volumeUnit);
    }
    formData.append("StoreId", storeId!.toString());
    formData.append("IsActive", isActive.toString()); //novo

    images.forEach((image, index) => {
      formData.append("Files", {
        uri: image.uri,
        type: "image/jpeg",
        name: `photo_${index}.jpg`,
      } as any);
    });

    console.log("Payload to send:", formData);

    try {
      setLoading(true);
      console.log(formData);
      const response = await api.post("/Catalog/products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload Success:", response.data);
      Alert.alert(t("success"), t("store_updated"));
      router.back();
    } catch (error: any) {
      console.error("Upload Error:", error.response?.data || error.message);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <SetHeaderRight title={t("add_a_product")} />
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 150}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("add_a_product")}</Text>

        <View style={[styles.form, { zIndex: 0 }]}>
          <InputField
            label={t("product_name")}
            value={name}
            onChangeText={setName}
            placeholder={t("enter_product_name")}
          />

          <InputField
            label={t("retail_price")}
            value={price}
            onChangeText={setPrice}
            placeholder={t("enter_retail_price")}
            keyboardType="decimal-pad"
          />

          {/* Veleprodajna Cijena */}
          <InputField
            label={t("wholesale_price")}
            value={wholesalePrice}
            onChangeText={setWholesalePrice}
            placeholder={t("enter_wholesale_price")}
            keyboardType="decimal-pad"
          />

          {/* Threshold za veleprodajnu cijena */}
          <InputField
            label={t("wholesale_threshold")}
            value={wholesaleThreshold}
            onChangeText={setWholesaleThreshold}
            placeholder={t("enter_wholesale_threshold")}
            keyboardType="decimal-pad"
          />

          <InputField
            label={t("weight")}
            value={weight}
            onChangeText={setWeight}
            placeholder={t("enter_weight")}
            keyboardType="decimal-pad"
          />

          <DropdownPicker
            open={weightOpen}
            value={weightUnit}
            items={weightItems}
            setOpen={setWeightOpen}
            setValue={setWeightUnit}
            setItems={setWeightItems}
            placeholder={t("select-unit")}
          />

          <InputField
            label={t("volume")}
            value={volume}
            onChangeText={setVolume}
            placeholder={t("enter_volume")}
            keyboardType="decimal-pad"
          />

          <DropdownPicker
            open={volumeOpen}
            value={volumeUnit}
            items={volumeItems}
            setOpen={setVolumeOpen}
            setValue={setVolumeUnit}
            setItems={setVolumeItems}
            placeholder={t("select-unit")}
          />

          <DropdownPicker
            open={categoryOpen}
            value={category}
            items={categories}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            setItems={setCategories}
            placeholder={t("select_category")}
          />

          {/* << NOVO: Switch za IsAvailable >> */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t("is_available")}</Text>
            <Switch
              trackColor={{ false: "#d1d5db", true: "#a7f3d0" }} // Svetlije boje
              thumbColor={isActive ? "#10b981" : "#f9fafb"} // Zelena/Svetlo siva
              ios_backgroundColor="#e5e7eb"
              onValueChange={setIsActive}
              value={isActive}
            />
          </View>

          <SubmitButton
            label={t("images")}
            onPress={pickImages}
            buttonText={t("select_images")}
          />

          <ImagePreviewList images={images} />

          <SubmitButton
            onPress={handleSave}
            loading={loading}
            buttonText={t("save_changes")}
          />
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 40,
    paddingTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4E8D7C",
    textAlign: "center",
    marginTop: 20,
  },
  form: {
    padding: 16,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20, // Dodaj malo veći razmak ispod switcha
    paddingVertical: 10, // Vertikalni padding za bolji izgled
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
});
