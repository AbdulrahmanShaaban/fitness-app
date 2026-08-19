import { useLocalSearchParams, useRouter } from "expo-router";
import { Copy, Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AddExerciseSheet } from "@/components/sections/AddExerciseSheet";
import { SessionExerciseBlock } from "@/components/sections/SessionExerciseBlock";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/TextField";
import { useClient } from "@/lib/hooks/useClients";
import {
  useAddExerciseToSession,
  useAddSet,
  useCopyPreviousSession,
  useCreateSession,
  useDeleteSession,
  useDeleteSet,
  useRemoveExerciseFromSession,
  useSessionDetail,
  useUpdateSession,
  useUpdateSet,
} from "../../lib/hooks/useSessions";
import { formatDate, todayIso } from "../../lib/utils/date";

export default function NewSessionScreen() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { data: client } = useClient(clientId);

  const createSession = useCreateSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: detail, isLoading } = useSessionDetail(sessionId ?? undefined);
  const updateSession = useUpdateSession();
  const copyPrevious = useCopyPreviousSession();
  const deleteSession = useDeleteSession();
  const addExercise = useAddExerciseToSession();
  const removeExercise = useRemoveExerciseFromSession();
  const addSet = useAddSet();
  const updateSet = useUpdateSet();
  const deleteSet = useDeleteSet();

  const [templateName, setTemplateName] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!sessionId && !creating && clientId) {
      setCreating(true);
      createSession
        .mutateAsync({ clientId })
        .then((s) => {
          if (!cancelled) setSessionId(s.id);
        })
        .catch(() => {
          if (!cancelled) {
            Alert.alert("Error", "Could not create the session.");
          }
        })
        .finally(() => {
          if (!cancelled) setCreating(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [sessionId, creating, clientId, createSession]);

  const commitTemplateName = () => {
    if (sessionId && templateName.trim() !== (detail?.session.templateName ?? "")) {
      updateSession.mutate({ id: sessionId, patch: { templateName: templateName.trim() || null } });
    }
  };

  const handleCopyPrevious = async () => {
    if (!clientId || !sessionId) return;
    const result = await copyPrevious.mutateAsync({ clientId, templateName });
    if (result.copied && result.session) {
      await deleteSession.mutateAsync(sessionId);
      setSessionId(result.session.id);
      Alert.alert("Copied", "Previous session copied. Adjust the numbers as you train.");
    } else {
      Alert.alert("Nothing to copy", "No previous session found for this client.");
    }
  };

  const handleFinish = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/client/${clientId}`);
  };

  const handleDiscard = () => {
    Alert.alert("Discard session?", "Delete this session and its logged sets.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: handleFinish },
    ]);
  };

  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-ink"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3.5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-body text-lg font-semibold" numberOfLines={1}>
              {client.fullName}
            </Text>
            <Text className="text-faint text-[13px]">{formatDate(todayIso())}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Discard session"
            onPress={handleDiscard}
            className="h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface2"
          >
            <X size={16} color="#8E98A5" />
          </Pressable>
        </View>

        <TextField
          label="Template name (used for Copy Previous)"
          placeholder="e.g. Upper A"
          value={templateName}
          onChangeText={setTemplateName}
          onBlur={commitTemplateName}
        />

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              label="Copy previous session"
              onPress={handleCopyPrevious}
              variant="secondary"
              icon={<Copy size={16} color="#F5A524" />}
              loading={copyPrevious.isPending}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Add exercise"
              onPress={() => setSheetOpen(true)}
              variant="secondary"
              icon={<Plus size={16} color="#E9EDF2" />}
            />
          </View>
        </View>

        {isLoading || creating ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#F5A524" />
          </View>
        ) : !detail || detail.exercises.length === 0 ? (
          <Card className="items-center gap-1 py-6">
            <EmptyState
              icon={Plus}
              title="No exercises yet"
              hint="Add the first exercise for this session."
              actionLabel="Add exercise"
              onAction={() => setSheetOpen(true)}
            />
          </Card>
        ) : (
          detail.exercises.map((block) => (
            <SessionExerciseBlock
              key={block.sessionExercise.id}
              block={block}
              clientId={clientId}
              sessionId={sessionId as string}
              onRemoveExercise={() =>
                removeExercise.mutate(block.sessionExercise.id)
              }
              onAddSet={(input) =>
                addSet.mutate({
                  sessionExerciseId: block.sessionExercise.id,
                  input,
                })
              }
              onUpdateSet={(id, patch) => updateSet.mutate({ id, patch })}
              onDeleteSet={(id) => deleteSet.mutate(id)}
            />
          ))
        )}

        <Button
          label="Finish session"
          onPress={handleFinish}
          size="lg"
          icon={<X size={16} color="#0B0E12" />}
        />
        <Text className="text-center text-faint text-[11px]">
          Sets auto-save as you enter them. This session stays in history.
        </Text>
      </ScrollView>

      <AddExerciseSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={(exerciseId) => {
          setSheetOpen(false);
          if (sessionId) addExercise.mutate({ sessionId, exerciseId });
        }}
      />
    </KeyboardAvoidingView>
  );
}