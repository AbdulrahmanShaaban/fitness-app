import { useLocalSearchParams } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { SessionExerciseBlock } from "@/components/sections/SessionExerciseBlock";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useClient } from "@/lib/hooks/useClients";
import { useSessionDetail } from "@/lib/hooks/useSessions";
import { formatDate } from "@/lib/utils/date";

export default function SessionDetailScreen() {
  const { clientId, sessionId } = useLocalSearchParams<{ clientId: string; sessionId: string }>();
  const { data: client } = useClient(clientId);
  const { data: detail, isLoading } = useSessionDetail(sessionId);

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
        <Text className="text-body text-base">Session not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-3.5">
      <View className="gap-1">
        <Text className="text-body text-lg font-semibold">{client?.fullName ?? "Client"}</Text>
        <Text className="text-faint text-[13px]">
          {formatDate(detail.session.date)}
          {detail.session.templateName ? ` · ${detail.session.templateName}` : ""}
        </Text>
      </View>

      {detail.session.notes ? (
        <Card>
          <Text className="text-body text-[14px] leading-5">{detail.session.notes}</Text>
        </Card>
      ) : null}

      {detail.exercises.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No exercises" hint="This session was recorded empty." />
      ) : (
        detail.exercises.map((block) => (
          <SessionExerciseBlock
            key={block.sessionExercise.id}
            block={block}
            clientId={clientId}
            sessionId={sessionId}
            readOnly
            onRemoveExercise={() => {}}
            onAddSet={() => {}}
            onUpdateSet={() => {}}
            onDeleteSet={() => {}}
          />
        ))
      )}
    </ScrollView>
  );
}