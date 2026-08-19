import { useRouter } from "expo-router";
import { CalendarPlus, ClipboardList, Pencil, Ruler, Scale, Trash2, UserRound } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

import { formatDate } from "../../lib/utils/date";
import type { Client } from "../../types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";

interface ClientOverviewSectionProps {
  client: Client;
  onDelete: () => void;
}

export function ClientOverviewSection({ client, onDelete }: ClientOverviewSectionProps) {
  const router = useRouter();

  const confirmDelete = () => {
    Alert.alert("Delete client", `Delete ${client.fullName}? Their history stays hidden but recoverable.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start new session"
          onPress={() => router.push(`/session/new?clientId=${client.id}`)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-accent py-3"
        >
          <ClipboardList size={16} color="#0B0E12" />
          <Text className="text-ink text-[14px] font-semibold">Session</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New assessment"
          onPress={() => router.push(`/client/${client.id}/assessment/new`)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-line2 bg-surface2 py-3"
        >
          <CalendarPlus size={16} color="#E9EDF2" />
          <Text className="text-body text-[14px] font-medium">Assessment</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit client"
          onPress={() => router.push(`/client/${client.id}/edit`)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-line2 bg-surface2 py-2.5"
        >
          <Pencil size={14} color="#8E98A5" />
          <Text className="text-muted text-[13px] font-medium">Edit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete client"
          onPress={confirmDelete}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-dangerDim py-2.5"
        >
          <Trash2 size={14} color="#F87171" />
          <Text className="text-danger text-[13px] font-medium">Delete</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        <StatTile icon={UserRound} label="Age" value={client.age != null ? String(client.age) : "—"} />
        <StatTile icon={Scale} label="Weight" value={client.currentWeightKg != null ? `${client.currentWeightKg} kg` : "—"} />
        <StatTile icon={Ruler} label="Height" value={client.heightCm != null ? `${client.heightCm} cm` : "—"} />
      </View>

      {client.goal ? (
        <Card>
          <Text className="text-faint text-[12px] font-medium uppercase tracking-wide">Goal</Text>
          <Text className="mt-1 text-body text-[15px] leading-6">{client.goal}</Text>
        </Card>
      ) : null}

      {client.generalNotes ? (
        <Card>
          <Text className="text-faint text-[12px] font-medium uppercase tracking-wide">Notes</Text>
          <Text className="mt-1 text-body text-[14px] leading-5">{client.generalNotes}</Text>
        </Card>
      ) : null}

      <Card>
        <Text className="text-faint text-[12px] font-medium uppercase tracking-wide">Client since</Text>
        <Text className="mt-1 text-body text-[14px]">
          {client.startDate ? formatDate(client.startDate) : "—"}
          {client.phone ? ` · ${client.phone}` : ""}
        </Text>
      </Card>

      {!client.goal && !client.generalNotes ? (
        <EmptyState
          icon={UserRound}
          title="No goal set"
          hint="Tap Edit to add a goal and notes for this client."
        />
      ) : null}
    </View>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <View className="flex-1 rounded-lg border border-line bg-surface px-3 py-3">
      <View className="flex-row items-center gap-1.5">
        <Icon size={13} color="#8E98A5" />
        <Text className="text-faint text-[11px] font-medium">{label}</Text>
      </View>
      <Text className="mt-1.5 text-body text-[15px] font-semibold tabular-nums">{value}</Text>
    </View>
  );
}