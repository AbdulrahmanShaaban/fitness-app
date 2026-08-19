import { Dumbbell, HeartPulse, Move, PersonStanding, Scale, SlidersHorizontal, StretchHorizontal } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { getAssessmentTypeDef } from "../../lib/constants/assessmentTypes";
import type { AssessmentType } from "../../types";

const ICONS: Record<string, LucideIcon> = {
  "person-standing": PersonStanding,
  move: Move,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  "stretch-horizontal": StretchHorizontal,
  scale: Scale,
  "sliders-horizontal": SlidersHorizontal,
};

interface AssessmentTypeIconProps {
  type: AssessmentType;
  size?: number;
  color?: string;
}

export function AssessmentTypeIcon({ type, size = 16, color = "#F5A524" }: AssessmentTypeIconProps) {
  const def = getAssessmentTypeDef(type);
  const Icon = ICONS[def.icon] ?? Dumbbell;
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      className="h-7 w-7 items-center justify-center rounded-md bg-accentDim"
    >
      <Icon size={size} color={color} strokeWidth={1.75} />
    </View>
  );
}