import { type LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-2 px-8 py-12">
      <View
        accessible={false}
        importantForAccessibility="no"
        className="h-14 w-14 items-center justify-center rounded-full bg-surface2"
      >
        <Icon size={26} color="#5C6672" strokeWidth={1.75} />
      </View>
      <Text className="text-body text-base font-semibold text-center">{title}</Text>
      {hint ? <Text className="text-muted text-[13px] text-center leading-5">{hint}</Text> : null}
      {actionLabel && onAction ? (
        <View className="mt-2">
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}