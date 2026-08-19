import { type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, type ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: ViewStyle;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface2 border border-line2",
  ghost: "bg-transparent",
  danger: "bg-dangerDim border border-danger/40",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-5 py-3.5",
};

const LABEL_CLASSES: Record<Variant, string> = {
  primary: "text-ink",
  secondary: "text-body",
  ghost: "text-accent",
  danger: "text-danger",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className = "",
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        style,
      ]}
      className={`flex-row items-center justify-center gap-2 rounded-lg ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#0B0E12" : variant === "ghost" ? "#F5A524" : "#E9EDF2"}
        />
      ) : (
        icon
      )}
      <Text
        className={`font-semibold ${LABEL_CLASSES[variant]}`}
        style={{ fontSize: size === "sm" ? 13 : size === "md" ? 15 : 16 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}