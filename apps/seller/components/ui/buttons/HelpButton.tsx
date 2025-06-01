import { StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCopilot } from "react-native-copilot";

type HelpButtonProps = {
  onStepChange?: (step: any) => void;
  delay?: number;
  beforeStart?: () => void;
};

const HelpButton: React.FC<HelpButtonProps> = ({
  onStepChange,
  delay,
  beforeStart,
}) => {
  const handleStart = (delay: number | undefined) => {
    beforeStart && beforeStart();
    if (delay) {
      setTimeout(() => {
        start();
      }, delay);
    } else {
      start();
    }
  };

  const { start, copilotEvents } = useCopilot();
  useEffect(() => {
    onStepChange && copilotEvents.on("stepChange", onStepChange);

    return () => {
      onStepChange && copilotEvents.off("stepChange", onStepChange);
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        handleStart(delay);
      }}
      style={styles.helpButton}
    >
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
