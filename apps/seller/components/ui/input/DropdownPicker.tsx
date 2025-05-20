import React from "react";
import { View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface DropdownPickerProps {
  open: boolean;
  value: any;
  placeholder: string;
  items: { label: any; value: any }[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: React.Dispatch<React.SetStateAction<any>>;
  setItems: React.Dispatch<React.SetStateAction<{ label: any; value: any }[]>>;
}

const DropdownPicker: React.FC<DropdownPickerProps> = ({
  open,
  value,
  items,
  setOpen,
  setValue,
  setItems,
  placeholder,
}) => {
  return (
    <View style={styles.wrapper}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="SCROLLVIEW"
        placeholder={placeholder}
        maxHeight={250}             // Allow space for multiple items
        zIndex={3000}               // High zIndex for dropdown
        zIndexInverse={1000}   
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 3000,                  // Important for the parent container
  },
  dropdown: {
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
});

export default DropdownPicker;
