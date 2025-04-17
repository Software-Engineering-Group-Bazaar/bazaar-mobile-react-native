import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>["name"];
interface SubmitButtonProps extends TouchableOpacityProps {
  buttonText: string;
  loading?: boolean;
  social?: boolean;
  icon?: FontAwesomeIconName;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  buttonText,
  social = false,
  icon,
  ...rest
}) => {
  const iconColors: Record<string, string> = {
    facebook: "#1877F2",
    google: "#DB4437",
  };

  const iconColor = icon ? iconColors[icon] ?? "#ffffff" : "#ffffff";

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
          {icon && (
            <FontAwesome
              name={icon}
              size={20}
              color={iconColor}
              style={styles.icon}
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
    flexDirection: "row",
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
  icon: {
    marginRight: 10,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: 16,
  },
});

export default SubmitButton;
