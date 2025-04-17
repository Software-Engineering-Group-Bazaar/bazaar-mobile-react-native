import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { apiFetchAllCategoriesAsync } from "../api/storeApi";
import api from "../api/defaultApi";
import { useRouter } from "expo-router";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";

// TODO: Kad backend bude spreman, otkomentarisati ove pozive
// import { apiGetStoreCategoriesAsync, apiCreateStoreAsync } from '../api/store';

export default function PostavkeProdavnice() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  //const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryItems, setCategoryItems] = useState<
    { label: string; value: number }[]
  >([]);

  const navigation = useNavigation();

  useEffect(() => {
    async function fetchCategories() {
      const categories = await apiFetchAllCategoriesAsync();
      setCategoryItems(categories);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: "Postavke prodavnice",
    });
  }, [navigation]);

  /*const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };*/

  const handleSave = async () => {
    if (
      !name.trim() ||
      !address.trim() ||
      !description.trim() ||
      !selectedCategoryId
    ) {
      console.log(name.trim());
      console.log(address.trim());
      console.log(description.trim());
      console.log(selectedCategoryId);
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        categoryId: selectedCategoryId,
        address: address.trim(),
        description: description.trim(),
      };
      const response = await api.post("/Stores", payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert(t("success"), t("store_updated"));
        router.replace("../(tabs)/pregled_prodavnica");
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error("Greška prilikom slanja zahtjeva:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      <View style={styles.container}>
        <Text style={styles.title}>{t("store_settings")}</Text>

        {/*<TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <>
              <FontAwesome name="camera" size={24} color="#4E8D7C" />
              <Text style={styles.imagePickerText}>{t('upload_image')}</Text>
            </>
          )}
        </TouchableOpacity>*/}

        <View style={styles.inputContainer}>
          <FontAwesome5
            name="store"
            size={20}
            color="#888"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("store_name")}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome
            name="map-marker"
            size={20}
            color="#888"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("address")}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={open}
            value={selectedCategoryId}
            items={categoryItems}
            setOpen={setOpen}
            setValue={setSelectedCategoryId}
            setItems={setCategoryItems}
            placeholder={t("select_category")}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            listMode="SCROLLVIEW"
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome
            name="file-text"
            size={20}
            color="#888"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("description")}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome name="save" size={18} color="#fff" />
              <Text style={styles.buttonText}> {t("save_changes")}</Text>
            </>
          )}
        </TouchableOpacity>
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
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePickerText: {
    marginTop: 10,
    color: "#4E8D7C",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f7f7f7",
    marginBottom: 15,
    zIndex: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dropdownWrapper: {
    width: "100%",
    zIndex: 1000,
    marginBottom: 15,
  },
  dropdown: {
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: "#ccc",
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  button: {
    backgroundColor: "#4E8D7C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});
