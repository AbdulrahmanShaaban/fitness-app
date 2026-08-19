import { FlashList } from "@shopify/flash-list";
import { Dumbbell, Plus, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Sheet } from "../../components/ui/Sheet";
import { TextField } from "../../components/ui/TextField";
import { useCreateExercise, useExercises } from "../../lib/hooks/useExercises";

export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [notes, setNotes] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const { data: exercises, isLoading } = useExercises(debouncedQuery);
  const createExercise = useCreateExercise();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const groups = useMemoGroup(exercises ?? []);

  const handleCreate = async () => {
    if (name.trim().length === 0) return;
    await createExercise.mutateAsync({
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || undefined,
      notes: notes.trim() || undefined,
      videoLink: videoLink.trim() || undefined,
    });
    setName("");
    setMuscleGroup("");
    setNotes("");
    setVideoLink("");
    setAddOpen(false);
  };

  return (
    <View className="flex-1 bg-ink">
      <View className="flex-row items-center gap-2 px-4 pb-3 pt-2">
        <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-line bg-surface2 px-3">
          <Search size={16} color="#5C6672" />
          <TextInput
            accessibilityLabel="Search exercises"
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises…"
            placeholderTextColor="#5C6672"
            className="flex-1 py-2.5 text-body text-base"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add custom exercise"
          onPress={() => setAddOpen(true)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="h-11 w-11 items-center justify-center rounded-lg bg-accent"
        >
          <Plus size={20} color="#0B0E12" />
        </Pressable>
      </View>

      <FlashList
        data={exercises ?? []}
        keyExtractor={(e) => e.id}
        contentContainerClassName="px-4 pb-6"
        ItemSeparatorComponent={() => <View className="h-2" />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon={Dumbbell}
            title={isLoading ? "Loading…" : "No exercises"}
            hint={
              isLoading
                ? undefined
                : debouncedQuery
                  ? "No exercise matches that search."
                  : undefined
            }
          />
        }
        renderItem={({ item }) => (
          <View className="rounded-lg border border-line bg-surface px-3.5 py-3">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-body text-[15px] font-medium">{item.name}</Text>
              {item.isCustom ? (
                <View className="rounded bg-accentDim px-1.5 py-0.5">
                  <Text className="text-accent text-[10px] font-semibold">custom</Text>
                </View>
              ) : null}
            </View>
            <Text className="mt-0.5 text-faint text-[12px]">
              {item.muscleGroup ?? "— group —"}
            </Text>
            {item.notes ? (
              <Text className="mt-1 text-muted text-[12px] leading-4" numberOfLines={2}>
                {item.notes}
              </Text>
            ) : null}
          </View>
        )}
        ListHeaderComponent={
          groups.length > 1 ? (
            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {groups.map((g) => (
                <View key={g} className="rounded-full bg-surface2 px-2.5 py-1">
                  <Text className="text-faint text-[11px] font-medium">{g}</Text>
                </View>
              ))}
            </View>
          ) : null
        }
      />

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="Custom exercise">
        <View className="gap-3 px-4 pb-4">
          <TextField
            label="Name *"
            placeholder="e.g. Bulgarian Split Squat"
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TextField
            label="Muscle group"
            placeholder="e.g. Legs"
            value={muscleGroup}
            onChangeText={setMuscleGroup}
          />
          <TextField
            label="Notes"
            placeholder="Cues, setup notes…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TextField
            label="Video link (optional)"
            placeholder="https://…"
            autoCapitalize="none"
            value={videoLink}
            onChangeText={setVideoLink}
          />
          <Button
            label="Create exercise"
            onPress={handleCreate}
            loading={createExercise.isPending}
          />
        </View>
      </Sheet>
    </View>
  );
}

function useMemoGroup(exercises: Array<{ muscleGroup?: string | null }>): string[] {
  const set = new Map<string, number>();
  for (const e of exercises) {
    const g = e.muscleGroup ?? "Other";
    set.set(g, (set.get(g) ?? 0) + 1);
  }
  return [...set.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([g]) => g);
}