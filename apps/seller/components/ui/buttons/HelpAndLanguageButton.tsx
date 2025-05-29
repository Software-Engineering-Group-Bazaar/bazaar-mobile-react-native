import { StyleSheet, View } from "react-native";
import React from "react";
import LanguageButton from "./LanguageButton";
import HelpButton from "./HelpButton";

interface HelpAndLanguageButtonProps {
  showLanguageButton?: boolean;
  showHelpButton?: boolean;
}

const HelpAndLanguageButton: React.FC<HelpAndLanguageButtonProps> = ({
  showLanguageButton = true,
  showHelpButton = true,
}) => {
  return (
    <View style={styles.topButtonsContainer}>
      <View style={styles.languageWrapper}>
        {showLanguageButton && <LanguageButton />}
      </View>
      {showHelpButton && <HelpButton />}
    </View>
  );
};

export default HelpAndLanguageButton;

const styles = StyleSheet.create({
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  languageWrapper: {
    flexShrink: 1,
  },
});
