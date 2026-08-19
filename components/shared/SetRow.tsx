import { StickyNote, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

import { useRowAnimations } from "../../lib/animations/presets";
import type { SetRecord } from "../../types";
import { TabularText } from "../ui/TabularText";

interface SetRowProps {
  set: SetRecord;
  readOnly?: boolean;
  autoFocusWeight?: boolean;
  onUpdate: (patch: { weight?: number; reps?: number; intensity?: string; notes?: string }) => void;
  onDelete: () => void;
}

function parseNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SetRow({ set, readOnly = false, autoFocusWeight = false, onUpdate, onDelete }: SetRowProps) {
  const { entering, exiting, layout } = useRowAnimations();
  const [weight, setWeight] = useState(String(set.weight));
  const [reps, setReps] = useState(String(set.reps));
  const [intensity, setIntensity] = useState(set.intensity ?? "");
  const [notes, setNotes] = useState(set.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setWeight(String(set.weight));
    setReps(String(set.reps));
    setIntensity(set.intensity ?? "");
    setNotes(set.notes ?? "");
  }, [set.id, set.weight, set.reps, set.intensity, set.notes]);

  const commitWeight = () => {
    const next = parseNumber(weight);
    if (next !== set.weight) onUpdate({ weight: next });
    else setWeight(String(set.weight));
  };

  const commitReps = () => {
    const next = parseNumber(reps);
    if (next !== set.reps) onUpdate({ reps: next });
    else setReps(String(set.reps));
  };

  const commitIntensity = () => {
    if (intensity.trim() !== (set.intensity ?? "")) onUpdate({ intensity: intensity.trim() });
  };

  const commitNotes = () => {
    if (notes.trim() !== (set.notes ?? "")) onUpdate({ notes: notes.trim() });
  };

  return (
    <Animated.View entering={entering} exiting={exiting} layout={layout}>
      <View className="flex-row items-center gap-2 py-1.5">
        <View
          accessible={false}
          className="h-7 w-7 items-center justify-center rounded-md bg-surface2"
        >
          <TabularText className="text-faint text-[13px] font-semibold">
            {set.setNumber}
          </TabularText>
        </View>
        <TextInput
          accessibilityLabel={`Set ${set.setNumber} weight in kilograms`}
          value={weight}
          onChangeText={setWeight}
          onBlur={commitWeight}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          autoFocus={autoFocusWeight}
          editable={!readOnly}
          placeholder="0"
          placeholderTextColor="#5C6672"
          className="h-11 w-[92px] rounded-lg border border-line bg-surface2 px-2 text-center text-body text-lg tabular-nums"
        />
        <TextInput
          accessibilityLabel={`Set ${set.setNumber} reps`}
          value={reps}
          onChangeText={setReps}
          onBlur={commitReps}
          keyboardType="number-pad"
          inputMode="numeric"
          selectTextOnFocus
          editable={!readOnly}
          placeholder="0"
          placeholderTextColor="#5C6672"
          className="h-11 w-[92px] rounded-lg border border-line bg-surface2 px-2 text-center text-body text-lg tabular-nums"
        />
        <TextInput
          accessibilityLabel={`Set ${set.setNumber} intensity`}
          value={intensity}
          onChangeText={setIntensity}
          onBlur={commitIntensity}
          editable={!readOnly}
          placeholder="RIR"
          placeholderTextColor="#5C6672"
          className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface2 px-2 text-center text-body text-[15px]"
        />
        {!readOnly ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={notesOpen ? "Hide set notes" : "Edit set notes"}
            accessibilityState={{ expanded: notesOpen }}
            onPress={() => setNotesOpen((v) => !v)}
            className={`h-9 w-9 items-center justify-center rounded-md ${
              notesOpen ? "bg-accentDim" : ""
            }`}
          >
            <StickyNote size={16} color={notesOpen ? "#F5A524" : "#5C6672"} />
          </Pressable>
        ) : null}
        {!readOnly ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete set ${set.setNumber}`}
            onPress={onDelete}
            className="h-9 w-9 items-center justify-center rounded-md"
          >
            <Trash2 size={16} color="#5C6672" />
          </Pressable>
        ) : null}
      </View>
      {notesOpen ? (
        <TextInput
          accessibilityLabel={`Set ${set.setNumber} notes`}
          value={notes}
          onChangeText={setNotes}
          onBlur={commitNotes}
          placeholder="Set notes…"
          placeholderTextColor="#5C6672"
          multiline
          className="mb-2 rounded-lg border border-line bg-surface2 px-3 py-2 text-body text-[14px]"
        />
      ) : null}
    </Animated.View>
  );
}