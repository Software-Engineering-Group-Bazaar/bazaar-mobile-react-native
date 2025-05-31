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
      {showLanguageButton && (
        <View
          style={[
            styles.buttonWrapper,
            !showHelpButton && { marginRight: 18, marginTop: 15 },
          ]}
        >
          <LanguageButton />
        </View>
      )}
      {showHelpButton && (
        <View style={styles.buttonWrapper}>
          <HelpButton
            delay={delay}
            onStepChange={onStepChange}
            beforeStart={beforeStart}
          />
        </View>
      )}
    </View>
  );
};

export default HelpAndLanguageButton;

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 13,
    right: 1,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
  },
  buttonWrapper: {
    marginLeft: 1,
  },
});
