import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-5">
      <Stack.Screen options={{ title: "Não encontrado" }} />
      <Text className="text-xl font-bold text-gray-900">
        Esta tela não existe.
      </Text>
      <Link href="/" className="mt-4 pt-4">
        <Text className="text-base text-indigo-600">Voltar ao início</Text>
      </Link>
    </View>
  );
}
