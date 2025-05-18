import NotificationIcon from "@/components/ui/NotificationIcon";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function CRUDLayout() {
  const { t } = useTranslation();
const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerRight: () => <NotificationIcon />,
      }}
    >
      <Stack.Screen
        name="dodaj_proizvod"
        options={{ title: t("add_product") }}
      />
      <Stack.Screen
        name="narudzba_detalji"
        options={{ title: t("order_details") }}
      />
      <Stack.Screen
        name="postavke_prodavnice"
        options={{ title: t("store_settings") }}
      />
      <Stack.Screen
        name="pregled_narudzbi"
        options={{ title: t("view_orders") }}
      />
      <Stack.Screen
        name="pregled_proizvoda"
        options={{ title: t("view_products") }}
      />
      <Stack.Screen
        name="prodavnica_detalji"
        options={{ title: t("store_details") }}
      />
      <Stack.Screen
        name="proizvod_detalji"
        options={{ title: t("product_details") }}
      />
      <Stack.Screen
        name="maps"
        options={{ title: t("ruta_za_dostavu") }}
      />
      <Stack.Screen
        name="default_maps"
        options={{ title: t("default_maps") }}
      />
      {/* NOVI EKRANI ZA TIKETE */}
      <Stack.Screen
        name="pregled_ticketa"
        options={{
          title: t("my_support_tickets") || "Moji tiketi podrške",
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <NotificationIcon />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="kreiraj_ticket"
        options={{
          title: t("create_new_ticket") || "Kreiraj novi tiket",
          // headerRight ostaje NotificationIcon iz screenOptions
        }}
      />
      <Stack.Screen
        name="ticket_detalji"
        options={{
          title: t("ticket_details_title") || "Detalji tiketa",
          // headerRight ostaje NotificationIcon iz screenOptions
        }}
      />
    </Stack>
  );
}
