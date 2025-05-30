/*import { StyleSheet, View } from "react-native";
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
*/
import React from "react";
import { StyleSheet, View } from "react-native";
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
    <View style={styles.absoluteContainer}>
      {showLanguageButton && <View style={styles.buttonWrapper}><LanguageButton /></View>}
      {showHelpButton && <View style={styles.buttonWrapper}><HelpButton /></View>}
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
