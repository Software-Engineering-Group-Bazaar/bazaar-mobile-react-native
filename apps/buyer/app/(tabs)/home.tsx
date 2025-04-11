import { View, Text, StyleSheet } from "react-native";
import { t } from 'i18next';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 {t('welcome')}</Text>
      <Text style={styles.subtitle}>{t('home-text')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4E8D7C",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
  },
});
