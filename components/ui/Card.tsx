import { type ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`rounded-lg border border-line bg-surface p-3.5 ${className}`}>
      {children}
    </View>
  );
}