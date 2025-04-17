import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams } from "expo-router";
import { apiFetchCategories } from "../api/productApi";
import api from "../api/defaultApi";
import * as FileSystem from "expo-file-system";
//-------------------Route Explorer---------------------------------
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import InputField from "@/components/ui/input/InputField";
import SubmitButton from "@/components/ui/input/SubmitButton";
import ImagePreviewList from "@/components/ui/ImagePreviewList";

const weightUnits = ["kg", "g", "lbs"];
const volumeUnits = ["L", "ml", "oz"];

export default function AddProductScreen() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
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
  const [category, setCategory] = useState<number>(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const router = useRouter();
  const { storeId } = useLocalSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    weight: "",
    weightunit: "kg",
    volume: "",
    volumeunit: "L",
    productcategoryid: "",
    photos: [],
  });

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

  async function prepareImage(imageUri: string) {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  }

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !weight.trim() || !volume.trim()) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }

    /*setFormData((prevData) => ({
      ...prevData, 
      name: name, 
      ProductCategoryId: category,
      RetailPrice: price,
      WholesalePrice: price,
      Weight: weight,
      WeightUnit: weightUnit,
      Volume: volume,
      VolumeUnit: volumeUnit,
      StoreId: storeId
    }));    

    for (const image of images) {
      const base64Image = await prepareImage(image.uri);
      formData.append("Files", base64Image);
    }*/
    // ✅ Construct JSON object
    /*const productPayload = {
      Name: name,
      ProductCategoryId: category,
      RetailPrice: parseFloat(price),
      WholesalePrice: parseFloat(price),
      Weight: parseFloat(weight),
      WeightUnit: weightUnit,
      Volume: parseFloat(volume),
      VolumeUnit: volumeUnit,
      StoreId: storeId,
      Files: images.map((image, index) => ({
        uri: image.uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      })), 
    };*/
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ProductCategoryId", category.toString());
    formData.append("RetailPrice", price.toString());
    formData.append("WholesalePrice", price.toString());
    formData.append("Weight", weight.toString());
    formData.append("WeightUnit", weightUnit);
    formData.append("Volume", volume.toString());
    formData.append("VolumeUnit", volumeUnit);
    formData.append("StoreId", storeId.toString());

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

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: t("add_a_product") });
  }, [i18n.language, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            label={t("price")}
            value={price}
            onChangeText={setPrice}
            placeholder={t("enter_price")}
            keyboardType="decimal-pad"
          />

          <InputField
            label={t("weight")}
            value={weight}
            onChangeText={setWeight}
            placeholder={t("enter_weight")}
            keyboardType="decimal-pad"
          />

          <View style={{ zIndex: 3000 }}>
            <DropDownPicker
              open={weightOpen}
              value={weightUnit}
              items={weightItems}
              setOpen={setWeightOpen}
              setValue={setWeightUnit}
              setItems={setWeightItems}
              placeholder={t("select_unit")}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

          <InputField
            label={t("volume")}
            value={volume}
            onChangeText={setVolume}
            placeholder={t("enter_volume")}
            keyboardType="decimal-pad"
          />

          <View style={{ zIndex: 2000 }}>
            <DropDownPicker
              open={volumeOpen}
              value={volumeUnit}
              items={volumeItems}
              setOpen={setVolumeOpen}
              setValue={setVolumeUnit}
              setItems={setVolumeItems}
              placeholder={t("select_unit")}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

          <Text style={styles.label}>{t("category")}</Text>
          <View style={{ zIndex: 1000 }}>
            <DropDownPicker
              open={categoryOpen}
              value={category}
              items={categories}
              setOpen={setCategoryOpen}
              setValue={setCategory}
              setItems={setCategories}
              placeholder={t("select_category")}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
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
  dropdown: {
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    zIndex: 1000,
  },
});
