import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AssessmentTestEditor, type DraftTest } from "@/components/sections/AssessmentTestEditor";
import { AssessmentTypeIcon } from "@/components/shared/AssessmentTypeIcon";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ASSESSMENT_TYPES } from "@/lib/constants/assessmentTypes";
import { useClient } from "@/lib/hooks/useClients";
import { useAddTest, useCreateAssessment } from "@/lib/hooks/useAssessments";
import { todayIso } from "@/lib/utils/date";
import type { AssessmentType } from "@/types";

export default function NewAssessmentScreen() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { data: client } = useClient(clientId);
  const createAssessment = useCreateAssessment();
  const addTest = useAddTest();

  const [type, setType] = useState<AssessmentType | null>(null);
  const [customTypeName, setCustomTypeName] = useState("");
  const [date, setDate] = useState(todayIso());
  const [notes, setNotes] = useState("");
  const [tests, setTests] = useState<DraftTest[]>([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!type) return;
    setSaving(true);
    try {
      const assessment = await createAssessment.mutateAsync({
        clientId,
        type,
        customTypeName:
          type === "custom" && customTypeName.trim().length > 0
            ? customTypeName.trim()
            : undefined,
        date: date.trim() || todayIso(),
        generalNotes: notes.trim() || undefined,
      });
      for (const t of tests) {
        const fields: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(t.fields)) {
          const trimmed = v.trim();
          if (trimmed === "") continue;
          const n = Number(trimmed.replace(",", "."));
          fields[k] = Number.isFinite(n) && k !== "side" ? n : trimmed;
        }
        await addTest.mutateAsync({
          assessmentId: assessment.id,
          testName: t.testName,
          fields,
          notes: t.notes.trim() || undefined,
        });
      }
      router.replace(`/client/${clientId}/assessment/${assessment.id}`);
    } finally {
      setSaving(false);
    }
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
        contentContainerClassName="p-4 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-body text-lg font-semibold">{client.fullName}</Text>

        {!type ? (
          <View className="gap-2">
            <Text className="text-muted text-[13px] font-medium">Assessment type</Text>
            <View className="flex-row flex-wrap gap-2">
              {ASSESSMENT_TYPES.map((def) => (
                <Pressable
                  key={def.type}
                  accessibilityRole="button"
                  accessibilityLabel={`${def.label} assessment`}
                  onPress={() => setType(def.type)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="w-[31%] items-center gap-1.5 rounded-lg border border-line2 bg-surface2 px-2 py-3.5"
                >
                  <AssessmentTypeIcon type={def.type} size={20} />
                  <Text className="text-body text-[13px] font-medium">{def.label}</Text>
                  <Text className="text-center text-faint text-[10px] leading-3.5">
                    {def.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <AssessmentTypeIcon type={type} size={18} />
                <Text className="text-body text-base font-semibold">
                  {ASSESSMENT_TYPES.find((d) => d.type === type)?.label}
                </Text>
              </View>
              <Button label="Change type" onPress={() => setType(null)} variant="ghost" size="sm" />
            </View>

            {type === "custom" ? (
              <TextField
                label="Assessment name *"
                placeholder="e.g. Shoulder Rehab Check"
                value={customTypeName}
                onChangeText={setCustomTypeName}
              />
            ) : null}

            <View className="flex-row gap-3">
              <TextField
                label="Date"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                containerClassName="flex-1"
              />
            </View>

            <TextField
              label="General notes"
              placeholder="Context for this assessment…"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />

            <AssessmentTestEditor
              assessmentType={type}
              tests={tests}
              onChange={setTests}
            />

            <Button
              label="Save assessment"
              onPress={save}
              size="lg"
              loading={saving}
              disabled={tests.length === 0 || (type === "custom" && customTypeName.trim() === "")}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}