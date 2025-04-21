import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface CreateButtonProps extends TouchableOpacityProps {
  loading?: boolean;
  text: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({
  loading = false,
  text,
  ...rest
}) => {
  const { t } = useTranslation(); // Using i18next for translation

  return (
    <TouchableOpacity style={styles.createButton} disabled={loading} {...rest}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <FontAwesome5
            name="plus"
            size={14}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.createButtonText}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4E8D7C",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CreateButton;
