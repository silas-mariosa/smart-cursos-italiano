import { Text } from "react-native";

import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { useMe } from "@/hooks/useMe";

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const { data } = useMe(!!token);

  return (
    <Screen>
      <Text className="text-base text-gray-900">
        Bem-vindo, {user?.name ?? data?.user.name}
      </Text>
      <Text className="text-sm text-gray-600">{user?.email}</Text>
    </Screen>
  );
}
