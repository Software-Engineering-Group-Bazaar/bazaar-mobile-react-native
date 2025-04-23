import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

type Props = {
  route: string;
};

const ScreenExplorerButton: React.FC<Props> = ({ route }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.replace(route)}
      style={styles.button}
    >
      <Text style={styles.text}>Screen Explorer</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 40,
    right: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  text: {
    fontSize: 8,
    textAlign: "center",
  },
});

export default ScreenExplorerButton;
