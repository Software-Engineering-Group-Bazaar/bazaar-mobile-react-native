import React, { useState } from "react";
import { Modal, TouchableOpacity, Text, StyleSheet, View, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";


const LANGUAGES = [
 { code: "bs", label: "Bosanski", flag: "🇧🇦" },
 { code: "en", label: "English", flag: "🇬🇧" },
 { code: "de", label: "Deutsch", flag: "🇩🇪" },
 { code: "es", label: "Español", flag: "🇪🇸" },
];


const LanguageButton: React.FC = () => {
 const { i18n } = useTranslation();
 const [modalVisible, setModalVisible] = useState(false);


 const changeLanguage = (code: string) => {
   i18n.changeLanguage(code);
   setModalVisible(false);
 };


 return (
   <>
     <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.languageButton}>
       <FontAwesome name="language" size={18} color="#4E8D7C" />
       <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
     </TouchableOpacity>


     <Modal
       animationType="fade"
       transparent
       visible={modalVisible}
       onRequestClose={() => setModalVisible(false)}
     >
       <TouchableOpacity
         style={styles.modalOverlay}
         activeOpacity={1}
         onPressOut={() => setModalVisible(false)}
       >
         <View style={styles.modalContent}>
           <Text style={styles.modalTitle}>Select Language</Text>
           {LANGUAGES.map((lang) => (
             <TouchableOpacity
               key={lang.code}
               style={[
                 styles.languageOption,
                 i18n.language === lang.code && styles.selectedLanguageOption,
               ]}
               onPress={() => changeLanguage(lang.code)}
             >
               <Text style={styles.flag}>{lang.flag}</Text>
               <Text style={styles.label}>{lang.label}</Text>
             </TouchableOpacity>
           ))}
         </View>
       </TouchableOpacity>
     </Modal>
   </>
 );
};


const styles = StyleSheet.create({
  languageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },  
 languageText: {
   fontSize: 10,
   fontWeight: "600",
   color: "#4E8D7C",
   marginTop: 2,
 },
 modalOverlay: {
   flex: 1,
   backgroundColor: "rgba(0,0,0,0.4)",
   justifyContent: "center",
   alignItems: "center",
 },
 modalContent: {
   backgroundColor: "#fff",
   width: "80%",
   borderRadius: 16,
   padding: 20,
   alignItems: "center",
 },
 modalTitle: {
   fontSize: 16,
   fontWeight: "600",
   marginBottom: 16,
 },
 languageOption: {
   flexDirection: "row",
   alignItems: "center",
   paddingVertical: 10,
   width: "100%",
   justifyContent: "flex-start",
   paddingHorizontal: 10,
   borderBottomWidth: 0.5,
   borderBottomColor: "#ccc",
 },
 selectedLanguageOption: {
   backgroundColor: "#e0f2f1",
   borderRadius: 8,
 },
 flag: {
   fontSize: 20,
   marginRight: 10,
 },
 label: {
   fontSize: 16,
 },
});

export default LanguageButton;
