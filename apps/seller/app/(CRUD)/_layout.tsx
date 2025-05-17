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
      {/* NOVI EKRANI ZA TIKETE */}
      <Stack.Screen
        name="pregled_ticketa"
        options={{
          title: t("my_support_tickets") || "Moji tiketi podrške",
          headerRight: () => ( // Kombinuj sa NotificationIcon ili zameni ako treba samo jedno
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push("/(CRUD)/kreiraj_ticket")} // Pazi na putanju
                style={{ marginRight: 15, padding: 5 }}
              >
                <FontAwesome5 name="plus-circle" size={24} color="#4E8D7C" />
              </TouchableOpacity>
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
