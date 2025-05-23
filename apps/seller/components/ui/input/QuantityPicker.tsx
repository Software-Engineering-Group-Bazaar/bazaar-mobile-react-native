import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewProps,
} from "react-native";

interface Props extends ViewProps {
  value: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
}

const QuantityPicker: React.FC<Props> = ({
  value,
  onChange,
  min = 0,
  max = Infinity,
  ...rest
}: Props) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed !== value) {
      onChange(parsed);
    } else {
      setInputValue(value.toString());
    }
  };

  const increment = () => {
    const newValue = value + 1;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const decrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  return (
    <View style={[styles.container, rest.style]}>
      <TouchableOpacity onPress={decrement} style={styles.button}>
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <TextInput
        keyboardType="numeric"
        value={inputValue}
        onChangeText={setInputValue}
        style={styles.input}
        onBlur={handleBlur}
      />
      <TouchableOpacity onPress={increment} style={styles.button}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: { padding: 5, borderRadius: 4 },
  buttonText: { fontSize: 30, color: "#4E8D7C" },
  input: {
    width: 50,
    textAlign: "center",
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    paddingVertical: 5,
  },
});

export default QuantityPicker;
