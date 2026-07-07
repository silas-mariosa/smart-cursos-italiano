import { type ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSidebar } from "@/context/SidebarContext";
import { useCompactLayout } from "@/hooks/useCompactLayout";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const { isCompact } = useCompactLayout();
  const { isOpen, close } = useSidebar();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <View className="flex-1 flex-row">
        {!isCompact ? (
          <View className="w-72 border-r border-gray-200 bg-white">
            <AppSidebar />
          </View>
        ) : null}

        <View className="flex-1">
          <AppHeader />
          <View className="flex-1">{children}</View>
        </View>
      </View>

      {isCompact ? (
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={close}
          statusBarTranslucent
        >
          <View className="flex-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
              onPress={close}
              className="absolute inset-0 bg-black/45"
            />
            <SafeAreaView
              className="absolute bottom-0 left-0 top-0 w-[82%] max-w-[320px] bg-white shadow-2xl"
              edges={["top", "bottom", "left"]}
            >
              <AppSidebar onNavigate={close} />
            </SafeAreaView>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}
