import { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-3 p-5">
        {title ? (
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}
