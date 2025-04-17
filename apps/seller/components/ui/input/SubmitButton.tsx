import { FontAwesome } from "@expo/vector-icons";
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
  loading?: boolean;
  social?: boolean;
  icon?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  buttonText,
  social = false,
  icon,
  ...rest
}) => {
  const iconName: "google" | "facebook" | "question" =
    icon === "google" || icon === "facebook" ? icon : "question";

  return (
    <TouchableOpacity
      style={[styles.button, social && styles.socialButton]}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {social && (
            <FontAwesome
              name={iconName}
              size={20}
              color={icon === "facebook" ? "#1877F" : "#DB4437"}
            />
          )}
          <Text style={social ? styles.socialButtonText : styles.buttonText}>
            {buttonText}
          </Text>
        </>
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
  socialButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default SubmitButton;
