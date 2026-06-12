import { Pressable, Text } from "react-native";

import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { useMe } from "@/hooks/useMe";

export default function DashboardScreen() {
  const { user, logout, token } = useAuth();
  const { data } = useMe(!!token);

  return (
    <Screen title="Dashboard">
      <Text className="text-base text-gray-900">
        Bem-vindo, {user?.name ?? data?.user.name}
      </Text>
      <Text className="text-sm text-gray-600">{user?.email}</Text>
      <Pressable
        onPress={() => void logout()}
        className="items-center rounded-xl border border-gray-300 px-4 py-3"
      >
        <Text className="text-base font-medium text-gray-900">Sair</Text>
      </Pressable>
    </Screen>
  );
}
