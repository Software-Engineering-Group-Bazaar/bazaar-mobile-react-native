import React from "react";
import { StyleSheet, View } from "react-native";
import LanguageButton from "./LanguageButton";
import HelpButton from "./HelpButton";

interface HelpAndLanguageButtonProps {
  showLanguageButton?: boolean;
  showHelpButton?: boolean;
  onStepChange?: (step: any) => void;
  delay?: number;
  beforeStart?: () => void;
}

const HelpAndLanguageButton: React.FC<HelpAndLanguageButtonProps> = ({
  showLanguageButton = true,
  showHelpButton = true,
  onStepChange,
  delay,
  beforeStart,
}) => {
  return (
    <View style={styles.absoluteContainer}>
      {showLanguageButton && <LanguageButton />}
      {showHelpButton && (
        <HelpButton
          onStepChange={onStepChange}
          delay={delay}
          beforeStart={beforeStart}
        />
      )}
    </View>
  );
};

export default HelpAndLanguageButton;

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    flexDirection: "row",
    gap: 12,
    zIndex: 9999,
  },
});
