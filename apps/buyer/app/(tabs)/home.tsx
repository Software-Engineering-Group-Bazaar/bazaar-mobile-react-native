import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Welcome!</Text>
      <Text style={styles.subtitle}>This is Bazar buyer app.</Text>
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
