import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { AssessmentTestEditor, type DraftTest } from "@/components/sections/AssessmentTestEditor";
import { ClientPhotosSection } from "@/components/sections/ClientPhotosSection";
import { AssessmentTypeIcon } from "@/components/shared/AssessmentTypeIcon";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { getAssessmentTypeDef, testSummary } from "@/lib/constants/assessmentTypes";
import { useAddTest, useAssessmentDetail, useDeleteAssessment } from "@/lib/hooks/useAssessments";
import { formatDate } from "@/lib/utils/date";

export default function AssessmentDetailScreen() {
  const router = useRouter();
  const { clientId, assessmentId } = useLocalSearchParams<{
    clientId: string;
    assessmentId: string;
  }>();
  const { data: detail, isLoading } = useAssessmentDetail(assessmentId);
  const addTest = useAddTest();
  const deleteAssessment = useDeleteAssessment();

  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTest[]>([]);

  const handleSaveTest = async () => {
    for (const t of draft) {
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(t.fields)) {
        const trimmed = v.trim();
        if (trimmed === "") continue;
        const n = Number(trimmed.replace(",", "."));
        fields[k] = Number.isFinite(n) && k !== "side" ? n : trimmed;
      }
      await addTest.mutateAsync({
        assessmentId,
        testName: t.testName,
        fields,
        notes: t.notes.trim() || undefined,
      });
    }
    setDraft([]);
    setAddOpen(false);
  };

  const confirmDelete = () => {
    Alert.alert("Delete assessment", "Remove this assessment from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAssessment.mutateAsync(assessmentId);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="flex-1 items-center justify-center bg-ink px-8">
        <Text className="text-body text-base">Assessment not found.</Text>
      </View>
    );
  }

  const def = getAssessmentTypeDef(detail.assessment.type);

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <AssessmentTypeIcon type={detail.assessment.type} size={18} />
          <View>
            <Text className="text-body text-lg font-semibold">
              {detail.assessment.type === "custom"
                ? (detail.assessment.customTypeName ?? "Custom")
                : def.label}
            </Text>
            <Text className="text-faint text-[13px]">
              {formatDate(detail.assessment.date)}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete assessment"
          onPress={confirmDelete}
          className="h-9 w-9 items-center justify-center rounded-lg border border-danger/30 bg-dangerDim"
        >
          <Trash2 size={16} color="#F87171" />
        </Pressable>
      </View>

      {detail.assessment.generalNotes ? (
        <Card>
          <Text className="text-body text-[14px] leading-5">{detail.assessment.generalNotes}</Text>
        </Card>
      ) : null}

      {detail.tests.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No tests recorded"
          hint="Add tests to this assessment."
          actionLabel="Add test"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <View className="gap-2">
          {detail.tests.map((test) => (
            <Card key={test.id}>
              <Text className="text-body text-[15px] font-semibold">{test.testName}</Text>
              <Text className="mt-1 text-accent text-base font-semibold tabular-nums">
                {testSummary(test, detail.assessment.type)}
              </Text>
              {test.notes ? (
                <Text className="mt-1.5 text-muted text-[13px] leading-5">{test.notes}</Text>
              ) : null}
            </Card>
          ))}
          <Button
            label="Add test"
            onPress={() => setAddOpen(true)}
            variant="secondary"
            icon={<Plus size={15} color="#F5A524" />}
          />
        </View>
      )}

      <View>
        <Text className="font-heading text-body mb-2 text-base">Photos</Text>
        <ClientPhotosSection clientId={clientId} assessmentId={assessmentId} />
      </View>

      <Sheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add test — ${detail.assessment.type === "custom" ? (detail.assessment.customTypeName ?? "Custom") : def.label}`}
      >
        <ScrollView className="max-h-[70%]" contentContainerClassName="p-4 gap-4">
          <AssessmentTestEditor
            assessmentType={detail.assessment.type}
            tests={draft}
            onChange={setDraft}
          />
          <Button
            label="Save test(s)"
            onPress={handleSaveTest}
            size="lg"
            loading={addTest.isPending}
            disabled={draft.length === 0}
          />
        </ScrollView>
      </Sheet>
    </ScrollView>
  );
}