import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { clampNumber } from "../../lib/utils/format";
import { TabularText } from "./TabularText";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  label?: string;
  unit?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  precision = 0,
  label,
  unit,
}: StepperProps) {
  const round = (v: number) => {
    const factor = 10 ** precision;
    return Math.round(v * factor) / factor;
  };

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `Decrease ${label}` : "Decrease"}
        accessibilityState={{ disabled: value <= min }}
        disabled={value <= min}
        onPress={() => onChange(round(clampNumber(value - step, min, max)))}
        className="h-11 w-11 items-center justify-center rounded-lg border border-line2 bg-surface2 active:bg-surface"
      >
        <Minus size={18} color="#E9EDF2" />
      </Pressable>
      <View className="min-w-[88px] items-center justify-center rounded-lg border border-line bg-surface2 px-2 py-2.5">
        <TabularText className="text-body text-lg font-semibold">
          {value.toFixed(precision)}
        </TabularText>
        {unit ? <Text className="text-faint text-[11px]">{unit}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `Increase ${label}` : "Increase"}
        accessibilityState={{ disabled: value >= max }}
        disabled={value >= max}
        onPress={() => onChange(round(clampNumber(value + step, min, max)))}
        className="h-11 w-11 items-center justify-center rounded-lg border border-line2 bg-surface2 active:bg-surface"
      >
        <Plus size={18} color="#E9EDF2" />
      </Pressable>
    </View>
  );
}