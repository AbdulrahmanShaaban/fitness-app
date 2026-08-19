import { type ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSheetAnimations } from "../../lib/animations/presets";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { entering } = useSheetAnimations();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityLabel="Close"
        className="flex-1 bg-black/60"
        onPress={onClose}
        testID="sheet-backdrop"
      />
      <View className="absolute inset-x-0 bottom-0 max-h-[80%]">
        <Animated.View
          entering={entering}
          className="rounded-t-2xl border-t border-x border-line bg-surface pb-2"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="items-center py-2.5">
            <View className="h-1 w-10 rounded-full bg-line2" />
          </View>
          {title ? (
            <View className="px-4 pb-2">
              <Text className="font-heading text-body text-lg">{title}</Text>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}