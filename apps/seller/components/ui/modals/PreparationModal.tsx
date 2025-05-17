import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";

interface PreparationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  prepTime: number | null;
  setPrepTime: (time: number | null) => void;
  selfDelivery: boolean;
  setSelfDelivery: (val: boolean) => void;
}

const PreparationModal: React.FC<PreparationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  prepTime,
  setPrepTime,
  selfDelivery,
  setSelfDelivery,
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("Select Delivery Type")}</Text>

          <View style={styles.deliveryOptionsContainer}>
            <TouchableOpacity
              style={[styles.deliveryOption, selfDelivery && styles.selectedDeliveryOption]}
              onPress={() => setSelfDelivery(true)}
            >
              <Text style={[styles.deliveryOptionText, selfDelivery && styles.selectedDeliveryOptionText]}>
                {t("Self Delivery")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deliveryOption, !selfDelivery && styles.selectedDeliveryOption]}
              onPress={() => setSelfDelivery(false)}
            >
              <Text style={[styles.deliveryOptionText, !selfDelivery && styles.selectedDeliveryOptionText]}>
                {t("Admin Delivery")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalTitle}>{t("Expected Preparation Time")}</Text>

          <View style={styles.prepInputContainer}>
            <TextInput
              value={prepTime?.toString() || ""}
              onChangeText={(text) => setPrepTime(Number(text))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.minLabel}>min</Text>
          </View>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity style={[styles.sendOrdersButton, { flex: 1 }]} onPress={onSubmit}>
              <Text style={styles.sendOrdersText}>{t("Submit")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  deliveryOptionsContainer: { flexDirection: "row", gap: 8, marginBottom: 16 },
  deliveryOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedDeliveryOption: { backgroundColor: "#4E8D7C", borderColor: "#4E8D7C" },
  deliveryOptionText: { fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
  selectedDeliveryOptionText: { color: "#FFFFFF" },
  prepInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
    fontSize: 16,
    marginRight: 8,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  minLabel: { fontSize: 16, fontWeight: "500" },
  modalButtonsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  sendOrdersButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4E8D7C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendOrdersText: { color: "#FFFFFF", fontWeight: "600" },
});

export default PreparationModal;
