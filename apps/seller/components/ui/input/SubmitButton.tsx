import { t } from "i18next";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface SubmitButtonProps extends TouchableOpacityProps {
  buttonText: string;
  loading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  buttonText,
  ...rest
}) => {
  return (
    <TouchableOpacity style={styles.button} disabled={loading} {...rest}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{buttonText}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default SubmitButton;
