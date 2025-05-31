import { StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCopilot } from "react-native-copilot";

type HelpButtonProps = {
  onStepChange?: (step: any) => void;
};

const HelpButton: React.FC<HelpButtonProps> = ({ onStepChange }) => {
  const { start, copilotEvents } = useCopilot();
  useEffect(() => {
    onStepChange && copilotEvents.on("stepChange", onStepChange);

    return () => {
      onStepChange && copilotEvents.off("stepChange", onStepChange);
    };
  }, []);

  return (
    <TouchableOpacity onPress={() => start()} style={styles.helpButton}>
      <Ionicons name="help-circle-outline" size={36} color="#4E8D7C" />
    </TouchableOpacity>
  );
};

export default HelpButton;

const styles = StyleSheet.create({
  helpButton: {
    marginLeft: 10,
    padding: 6,
  },
});
