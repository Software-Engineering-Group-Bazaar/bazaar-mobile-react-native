import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
} from "react-native";

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>["name"];
interface InputFieldProps extends TextInputProps {
  isValid?: boolean;
  errorText?: string;
  label?: string;
  icon?: FontAwesomeIconName;
}

const InputField: React.FC<InputFieldProps> = ({
  isValid = true,
  errorText,
  icon,
  label,
  ...rest
}) => {
  return (
    <View style={styles.mainContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.textInputContainer}>
        {icon && (
          <FontAwesome
            name={icon}
            size={20}
            style={styles.inputIcon}
            color="#888"
          />
        )}
        <TextInput
          style={[styles.input, !isValid && styles.inputError]}
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          {...rest}
        />
        {!isValid && errorText ? (
          <Text style={styles.errorText}>{errorText}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "column",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f7f7f7",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
});

export default InputField;
