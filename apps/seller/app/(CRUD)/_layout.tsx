import NotificationIcon from "@/components/ui/NotificationIcon";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function CRUDLayout() {
  const { t } = useTranslation();

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
    </Stack>
  );
}
