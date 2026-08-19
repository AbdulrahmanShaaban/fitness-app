import { Plus, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { usePreviousPerformance } from "../../lib/hooks/useSessions";
import { formatWeight } from "../../lib/utils/format";
import type { SessionExerciseWithSets } from "../../types";
import { SetRow } from "../shared/SetRow";
import { TabularText } from "../ui/TabularText";

interface SessionExerciseBlockProps {
  block: SessionExerciseWithSets;
  clientId: string;
  sessionId: string;
  readOnly?: boolean;
  onRemoveExercise: () => void;
  onAddSet: (input: { weight: number; reps: number; intensity?: string; notes?: string }) => void;
  onUpdateSet: (id: string, patch: { weight?: number; reps?: number; intensity?: string; notes?: string }) => void;
  onDeleteSet: (id: string) => void;
}

export function SessionExerciseBlock({
  block,
  clientId,
  sessionId,
  readOnly = false,
  onRemoveExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}: SessionExerciseBlockProps) {
  const { data: previous } = usePreviousPerformance(
    clientId,
    block.exercise.id,
    sessionId
  );

  const lastSet = block.sets[block.sets.length - 1];
  const defaultWeight = lastSet?.weight ?? previous?.sets[previous.sets.length - 1]?.weight ?? 0;
  const defaultReps = lastSet?.reps ?? previous?.sets[previous.sets.length - 1]?.reps ?? 10;

  return (
    <View className="rounded-lg border border-line bg-surface p-3.5">
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <View className="flex-1 gap-0.5">
          <Text className="text-body text-[16px] font-semibold">{block.exercise.name}</Text>
          {block.exercise.muscleGroup ? (
            <Text className="text-faint text-[12px]">{block.exercise.muscleGroup}</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${block.exercise.name} from session`}
          onPress={onRemoveExercise}
          hitSlop={6}
          disabled={readOnly}
          className="h-8 w-8 items-center justify-center rounded-md"
        >
          <Trash2 size={16} color={readOnly ? "#323B47" : "#5C6672"} />
        </Pressable>
      </View>

      {previous && previous.sets.length > 0 ? (
        <View
          accessible={false}
          className="mb-2 flex-row items-center gap-2 rounded-md bg-surface2 px-2 py-1.5"
        >
          <Text className="w-7 text-faint text-[11px]">last</Text>
          {previous.sets.map((s) => (
            <View key={s.id} className="flex-row items-center gap-1">
              <TabularText className="text-faint text-[13px] tabular-nums">
                {formatWeight(s.weight)}×{s.reps}
              </TabularText>
              {s.intensity ? (
                <Text className="text-faint/70 text-[11px]">{s.intensity}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View className="mb-1 flex-row items-center gap-2 px-2">
        <Text className="w-7 text-faint text-[11px] font-medium">set</Text>
        <Text className="w-[92px] text-center text-faint text-[11px] font-medium">kg</Text>
        <Text className="w-[92px] text-center text-faint text-[11px] font-medium">reps</Text>
        <Text className="flex-1 text-center text-faint text-[11px] font-medium">RIR</Text>
        <View className="w-[76px]" />
      </View>

      {block.sets.map((set, index) => (
        <SetRow
          key={set.id}
          set={set}
          readOnly={readOnly}
          autoFocusWeight={!readOnly && block.sets.length > 1 && index === block.sets.length - 1}
          onUpdate={(patch) => onUpdateSet(set.id, patch)}
          onDelete={() => onDeleteSet(set.id)}
        />
      ))}

      {!readOnly ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add set to ${block.exercise.name}`}
          onPress={() =>
            onAddSet({ weight: defaultWeight, reps: defaultReps, intensity: lastSet?.intensity ?? undefined })
          }
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="mt-1 flex-row items-center justify-center gap-1.5 rounded-md border border-dashed border-line2 py-2.5"
        >
          <Plus size={15} color="#F5A524" />
          <Text className="text-accent text-[13px] font-semibold">Add set</Text>
        </Pressable>
      ) : null}
    </View>
  );
}