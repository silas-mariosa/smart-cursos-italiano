import { ReactNode } from "react";
import { View } from "react-native";

export function Screen({ children }: { title?: string; children: ReactNode }) {
  return <View className="flex-1 gap-3 p-5">{children}</View>;
}
