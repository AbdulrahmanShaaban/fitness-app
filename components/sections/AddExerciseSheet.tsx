import { Dumbbell, Plus, Search } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";

import { useExercises } from "../../lib/hooks/useExercises";
import { useCreateExercise } from "../../lib/hooks/useExercises";
import { EmptyState } from "../ui/EmptyState";
import { Sheet } from "../ui/Sheet";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";

interface AddExerciseSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (exerciseId: string) => void;
}

export function AddExerciseSheet({ visible, onClose, onAdd }: AddExerciseSheetProps) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const { data: exercises, isLoading, isError } = useExercises(query);
  const createExercise = useCreateExercise();

  const handleCreate = async () => {
    if (name.trim().length === 0) return;
    try {
      const created = await createExercise.mutateAsync({
        name: name.trim(),
        muscleGroup: muscleGroup.trim() || undefined,
      });
      setCreateOpen(false);
      setName("");
      setMuscleGroup("");
      onAdd(created.id);
    } catch {
      Alert.alert("Could not create exercise", "Try again in a moment.");
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add exercise">
      {!createOpen ? (
        <View className="gap-2">
          <View className="px-4 pb-1">
            <View className="flex-row items-center gap-2 rounded-lg border border-line bg-surface2 px-3">
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
          </View>
          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#F5A524" />
            </View>
          ) : isError ? (
            <View className="items-center gap-1 px-4 pb-2">
              <Text className="text-body text-[14px] font-medium">Could not load exercises.</Text>
              <Text className="text-faint text-[12px] text-center">
                Close and reopen the picker to try again.
              </Text>
            </View>
          ) : (
            <FlatList
              data={exercises ?? []}
              keyExtractor={(e) => e.id}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 340 }}
              contentContainerClassName="px-4 pb-2"
              ItemSeparatorComponent={() => <View className="h-1.5" />}
              ListEmptyComponent={
                <EmptyState
                  icon={Dumbbell}
                  title="No exercises found"
                  hint="Create a custom exercise."
                />
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.name}`}
                  onPress={() => onAdd(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-row items-center justify-between rounded-lg border border-line bg-surface2 px-3.5 py-3"
                >
                  <View className="flex-1">
                    <Text className="text-body text-[15px] font-medium">{item.name}</Text>
                    {item.muscleGroup ? (
                      <Text className="text-faint text-[12px]">{item.muscleGroup}</Text>
                    ) : null}
                  </View>
                  <Plus size={16} color="#F5A524" />
                </Pressable>
              )}
            />
          )}
          <View className="px-4 pb-2">
            <Button
              label="Create custom exercise"
              onPress={() => setCreateOpen(true)}
              variant="secondary"
            />
          </View>
        </View>
      ) : (
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
          <Button label="Create exercise" onPress={handleCreate} loading={createExercise.isPending} />
          <Button label="Back" onPress={() => setCreateOpen(false)} variant="ghost" />
        </View>
      )}
    </Sheet>
  );
}