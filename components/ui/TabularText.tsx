import { Text, type TextProps } from "react-native";

export function TabularText({ style, ...props }: TextProps) {
  return <Text style={[{ fontVariant: ["tabular-nums"] }, style]} {...props} />;
}