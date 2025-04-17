import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>["name"];
interface SubmitButtonProps extends TouchableOpacityProps {
  buttonText: string;
  loading?: boolean;
  social?: boolean;
  icon?: FontAwesomeIconName;
  small?: boolean;
  label?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  buttonText,
  social = false,
  icon,
  small = false,
  label,
  ...rest
}) => {
  const iconColors: Record<string, string> = {
    facebook: "#1877F2",
    google: "#DB4437",
  };

  const iconColor = icon ? iconColors[icon] ?? "#ffffff" : "#ffffff";

  return (
    <View style={styles.mainContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.innerContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            social && styles.socialButton,
            small && styles.smallButton,
          ]}
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
              <Text
                style={[
                  small ? styles.smallText : styles.buttonText,
                  social && styles.socialButtonText,
                ]}
              >
                {buttonText}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "column",
  },
  innerContainer: {
    flexDirection: "row",
  },
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
  smallButton: {
    width: "auto",
    height: "auto",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 0,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  smallText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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
    color: "black",
    fontWeight: "thin",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
});

export default SubmitButton;
