import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

export default function screenExplorer() {
  const router = useRouter();

  const goToScreen = (screen: string) => {
    router.replace(screen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(auth)/login")}
      >
        <Text style={styles.buttonText}>Go To Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(auth)/register")}
      >
        <Text style={styles.buttonText}>Go To Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../home")}
      >
        <Text style={styles.buttonText}>Go To Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(CRUD)/dodaj_proizvod")}
      >
        <Text style={styles.buttonText}>Go To Dodaj Proizvod</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(CRUD)/postavke_prodavnice")}
      >
        <Text style={styles.buttonText}>Go To Postavke Prodavnice</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(CRUD)/pregled_proizvoda")}
      >
        <Text style={styles.buttonText}>Go To Pregled Proizvoda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(CRUD)/prodavnice_detalji")}
      >
        <Text style={styles.buttonText}>Go To Prodavnica Detalji</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => goToScreen("../(CRUD)/proizod_detalji")}
      >
        <Text style={styles.buttonText}>Go To Proizvod Detalji</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4E8D7C",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});
