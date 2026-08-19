import { Calendar, ChevronRight, Dumbbell, Goal } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { formatDateShort } from "../../lib/utils/date";
import type { ClientWithStats } from "../../types";

interface ClientCardProps {
  client: ClientWithStats;
  onPress: () => void;
}

export function ClientCard({ client, onPress }: ClientCardProps) {
  const lastActive = client.lastSessionDate ?? client.lastAssessmentDate;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${client.fullName}, ${client.goal ?? "no goal"}`}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      className="rounded-lg border border-line bg-surface p-3.5"
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-body text-base font-semibold" numberOfLines={1}>
              {client.fullName}
            </Text>
            {client.age ? (
              <Text className="text-faint text-[13px] tabular-nums">{client.age}</Text>
            ) : null}
          </View>
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            {client.goal ? (
              <View className="flex-row items-center gap-1">
                <Goal size={12} color="#8E98A5" />
                <Text className="text-muted text-[12px]" numberOfLines={1}>
                  {client.goal}
                </Text>
              </View>
            ) : null}
            {client.startDate ? (
              <View className="flex-row items-center gap-1">
                <Calendar size={12} color="#8E98A5" />
                <Text className="text-faint text-[12px]">{formatDateShort(client.startDate)}</Text>
              </View>
            ) : null}
            {client.sessionCount > 0 ? (
              <View className="flex-row items-center gap-1">
                <Dumbbell size={12} color="#8E98A5" />
                <Text className="text-faint text-[12px] tabular-nums">
                  {client.sessionCount} sessions
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View className="items-end gap-1">
          {lastActive ? (
            <Text className="text-faint text-[11px]">active {formatDateShort(lastActive)}</Text>
          ) : (
            <Text className="text-faint text-[11px]">no activity yet</Text>
          )}
          <ChevronRight size={16} color="#5C6672" />
        </View>
      </View>
    </Pressable>
  );
}