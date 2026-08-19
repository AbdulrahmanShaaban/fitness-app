import { type LucideIcon } from "lucide-react-native";
import { Pressable, type ViewStyle } from "react-native";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  color = "#E9EDF2",
  size = 18,
  disabled = false,
  className = "",
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }, style]}
      className={`items-center justify-center rounded-lg p-2 ${className}`}
    >
      <Icon size={size} color={color} strokeWidth={2} />
    </Pressable>
  );
}