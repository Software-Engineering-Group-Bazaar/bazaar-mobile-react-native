import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// Add your SF Symbols to MaterialIcons mappings here, ensuring to map valid SF Symbols for iOS
const MAPPING = {
  // Valid SF Symbols for iOS
  "house.fill": "home", // SF Symbol 'house.fill' mapped to Material 'home'
  storefront: "store", // SF Symbol 'storefront' mapped to Material 'store'
  add: "add", // SF Symbol 'stepforward' mapped to Material 'stepforward'
  "chevron.left.forwardslash.chevron.right": "code", // Custom mapping
  "chevron.right": "chevron-right", // SF Symbol mapped to Material 'chevron-right'
  shippingbox: "inventory",
  "message.fill": "message",
  "wallet.fill": "wallet",
} as Partial<
  Record<
    import("expo-symbols").SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons for non-iOS platforms.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
