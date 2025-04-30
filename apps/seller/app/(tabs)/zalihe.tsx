import { View, Text, StyleSheet } from "react-native";
import React from "react";

const ZaliheScreen = () => {
  return (
    <View style={styles.container}>
      <Text>zalihe</Text>
    </View>
  );
};

export default ZaliheScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
