import { useRouter } from "expo-router";
import { CalendarPlus } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAssessments } from "../../lib/hooks/useAssessments";
import { getAssessmentTypeDef } from "../../lib/constants/assessmentTypes";
import { formatDate } from "../../lib/utils/date";
import { AssessmentTypeIcon } from "../shared/AssessmentTypeIcon";
import { EmptyState } from "../ui/EmptyState";

interface ClientAssessmentsSectionProps {
  clientId: string;
  onNewAssessment: () => void;
}

export function ClientAssessmentsSection({ clientId, onNewAssessment }: ClientAssessmentsSectionProps) {
  const router = useRouter();
  const { data: assessments, isLoading, isError } = useAssessments(clientId);

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center gap-1 rounded-lg border border-line bg-surface px-4 py-8">
        <Text className="text-body text-[14px] font-medium">Could not load assessments.</Text>
        <Text className="text-faint text-[12px] text-center">
          Pull to refresh to try again.
        </Text>
      </View>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No assessments yet"
        hint="Body measurements, movement screens, cardio and strength tests."
        actionLabel="New assessment"
        onAction={onNewAssessment}
      />
    );
  }

  return (
    <View className="gap-2">
      {assessments.map((a) => {
        const def = getAssessmentTypeDef(a.type);
        return (
          <Pressable
            key={a.id}
            accessibilityRole="button"
            accessibilityLabel={`${def.label} assessment from ${formatDate(a.date)}`}
            onPress={() => router.push(`/client/${clientId}/assessment/${a.id}`)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-row items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3"
          >
            <AssessmentTypeIcon type={a.type} />
            <View className="flex-1 gap-0.5">
              <Text className="text-body text-[15px] font-medium">
                {a.type === "custom" ? (a.customTypeName ?? "Custom") : def.label}
              </Text>
              <Text className="text-faint text-[12px]">{formatDate(a.date)}</Text>
            </View>
            <Text className="text-faint text-[11px] tabular-nums">open →</Text>
          </Pressable>
        );
      })}
    </View>
  );
}