import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

interface TouchableCardProps extends TouchableOpacityProps {
  title: string;
  textRows:(string | React.ReactNode)[];
}

const TouchableCard: React.FC<TouchableCardProps> = ({
  title,
  textRows,
  ...rest
}) => {
  return (
    <TouchableOpacity style={styles.section} {...rest}>
      <View style={styles.storeInfo}>
        <Text style={styles.cardTitle}>{title}</Text>
        {textRows.map((row, index) => (
          <Text style={styles.textRow} key={index}>
            {row}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // povećano
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 5, // Android sjena
  },
  storeInfo: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4E8D7C",
    marginBottom: 4,
  },
  textRow: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default TouchableCard;
