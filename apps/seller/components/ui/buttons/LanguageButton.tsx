import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const LanguageButton: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => {
        i18n.changeLanguage(i18n.language === "en" ? "bs" : "en");
      }}
      style={styles.languageButton}
    >
      <FontAwesome name="language" size={18} color="#4E8D7C" />
      <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    position: "absolute",
    top: "5%",
    right: "5%",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  languageText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4E8D7C",
    marginTop: 2,
  },
});

export default LanguageButton;
