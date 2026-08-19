import { Pressable, Text, View } from "react-native";

export interface SegmentOption {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1 rounded-lg bg-surface2 p-1"
    >
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.key)}
            className={`flex-1 items-center rounded-md px-2 py-1.5 ${
              selected ? "bg-accent" : ""
            }`}
          >
            <Text
              className={`text-[13px] font-semibold ${
                selected ? "text-ink" : "text-muted"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}