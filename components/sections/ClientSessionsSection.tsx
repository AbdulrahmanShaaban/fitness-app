import { useRouter } from "expo-router";
import { ClipboardList, Copy } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useSessions } from "../../lib/hooks/useSessions";
import { formatDate } from "../../lib/utils/date";
import { EmptyState } from "../ui/EmptyState";

interface ClientSessionsSectionProps {
  clientId: string;
  onNewSession: () => void;
}

export function ClientSessionsSection({ clientId, onNewSession }: ClientSessionsSectionProps) {
  const router = useRouter();
  const { data: sessions, isLoading } = useSessions(clientId);

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No sessions yet"
        hint="Log the first session for this client."
        actionLabel="New session"
        onAction={onNewSession}
      />
    );
  }

  return (
    <View className="gap-2">
      {sessions.map((s) => (
        <Pressable
          key={s.id}
          accessibilityRole="button"
          accessibilityLabel={`Session from ${formatDate(s.date)}`}
          onPress={() => router.push(`/client/${clientId}/session/${s.id}`)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-row items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3"
        >
          <View className="flex-1 gap-0.5">
            <Text className="text-body text-[15px] font-medium">{formatDate(s.date)}</Text>
            <Text className="text-faint text-[12px]">
              {s.templateName ?? "Session"}
            </Text>
          </View>
          {s.templateName ? (
            <View className="mr-2 rounded bg-accentDim px-1.5 py-0.5">
              <View className="flex-row items-center gap-1">
                <Copy size={11} color="#F5A524" />
                <Text className="text-accent text-[11px] font-medium">template</Text>
              </View>
            </View>
          ) : null}
          <Text className="text-faint text-[11px] tabular-nums">open →</Text>
        </Pressable>
      ))}
    </View>
  );
}