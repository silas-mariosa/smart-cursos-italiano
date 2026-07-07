import { Pressable, Text, View } from "react-native";
import { usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useSidebar } from "@/context/SidebarContext";
import { useCompactLayout } from "@/hooks/useCompactLayout";
import { getHeaderTitle } from "@/lib/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const { isCompact } = useCompactLayout();
  const { toggle } = useSidebar();

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      {isCompact ? (
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          className="-ml-1 rounded-lg p-2 active:bg-gray-100"
        >
          <Ionicons name="menu" size={22} color="#111827" />
        </Pressable>
      ) : null}
      <Text className="flex-1 text-lg font-semibold text-gray-900">
        {getHeaderTitle(pathname)}
      </Text>
    </View>
  );
}
