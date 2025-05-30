import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCopilot } from "react-native-copilot";

const HelpButton: React.FC = () => {
  const { start } = useCopilot();
  return (
    <TouchableOpacity onPress={() => start()} style={styles.helpButton}>
      <Ionicons name="help-circle-outline" size={52} color="#4E8D7C" />
    </TouchableOpacity>
  );
};

export default HelpButton;

const styles = StyleSheet.create({
  helpButton: {
    padding: 6,
  },
});
