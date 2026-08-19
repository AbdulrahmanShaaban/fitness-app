import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, containerClassName = "", className = "", ...props },
  ref
) {
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label ? (
        <Text className="text-muted text-[13px] font-medium">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#5C6672"
        className={`rounded-lg border border-line bg-surface2 px-3 py-2.5 text-body text-base ${error ? "border-danger" : ""} ${className}`}
        {...props}
      />
      {error ? (
        <Text className="text-danger text-[12px]">{error}</Text>
      ) : hint ? (
        <Text className="text-faint text-[12px]">{hint}</Text>
      ) : null}
    </View>
  );
});