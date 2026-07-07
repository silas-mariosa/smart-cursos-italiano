import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { APP_NAV, isNavActive } from "@/lib/navigation";

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  async function handleLogout() {
    onNavigate?.();
    await logout();
    router.replace("/auth/login");
  }

  function navigate(href: (typeof APP_NAV)[number]["href"]) {
    onNavigate?.();
    router.push(href);
  }

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-gray-200 px-5 py-5">
        <Text className="text-lg font-bold text-gray-900">Curso Italiano</Text>
        <Text className="mt-1 text-sm text-gray-600">{user?.name ?? "Aluno"}</Text>
      </View>

      <ScrollView className="flex-1 px-3 py-4">
        <View className="gap-1">
          {APP_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => navigate(item.href)}
              className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${
                active ? "bg-emerald-50" : "active:bg-gray-100"
              }`}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? "#047857" : "#4b5563"}
              />
              <Text
                className={`text-base ${active ? "font-semibold text-emerald-800" : "text-gray-700"}`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 p-4">
        <Pressable
          onPress={() => void handleLogout()}
          className="flex-row items-center gap-3 rounded-xl px-3 py-3 active:bg-gray-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#4b5563" />
          <Text className="text-base text-gray-700">Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}
