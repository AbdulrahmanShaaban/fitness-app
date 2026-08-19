import { useRouter } from "expo-router";
import {
  Activity,
  CalendarPlus,
  ChevronRight,
  ClipboardList,
  Cloud,
  CloudOff,
  Database,
  Plus,
  Users,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ClientPickerSheet } from "../../components/shared/ClientPickerSheet";
import { useClients, useDashboardStats } from "../../lib/hooks/useClients";
import { useRecentSessions } from "../../lib/hooks/useSessions";
import { useSyncStore } from "../../lib/store/syncStore";
import { formatDateShort } from "../../lib/utils/date";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats } = useDashboardStats();
  const { data: recentClients } = useClients("");
  const { data: recentSessions } = useRecentSessions(4);
  const syncStatus = useSyncStore((s) => s.status);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"session" | "assessment">("session");

  const openPicker = useCallback((mode: "session" | "assessment") => {
    setPickerMode(mode);
    setPickerOpen(true);
  }, []);

  const handlePick = useCallback(
    (clientId: string) => {
      setPickerOpen(false);
      if (pickerMode === "session") {
        router.push(`/session/new?clientId=${clientId}`);
      } else {
        router.push(`/client/${clientId}/assessment/new`);
      }
    },
    [pickerMode, router]
  );

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1 rounded-lg border border-line bg-surface p-3.5">
          <View className="flex-row items-center gap-2">
            <Users size={16} color="#F5A524" />
            <Text className="text-faint text-[12px] font-medium">Clients</Text>
          </View>
          <Text className="mt-1 text-body text-3xl font-bold tabular-nums">
            {stats?.clientCount ?? "—"}
          </Text>
        </View>
        <View className="flex-1 rounded-lg border border-line bg-surface p-3.5">
          <View className="flex-row items-center gap-2">
            <Activity size={16} color="#34D399" />
            <Text className="text-faint text-[12px] font-medium">Assessments</Text>
          </View>
          <Text className="mt-1 text-body text-3xl font-bold tabular-nums">
            {stats?.assessmentCount ?? "—"}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new client"
            onPress={() => router.push("/client/new")}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-accent py-3.5"
          >
            <Plus size={16} color="#0B0E12" />
            <Text className="text-ink text-[14px] font-semibold">Client</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start new session"
            onPress={() => openPicker("session")}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-accent py-3.5"
          >
            <ClipboardList size={16} color="#0B0E12" />
            <Text className="text-ink text-[14px] font-semibold">Session</Text>
          </Pressable>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="New assessment"
            onPress={() => openPicker("assessment")}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-line2 bg-surface2 py-3"
          >
            <CalendarPlus size={16} color="#E9EDF2" />
            <Text className="text-body text-[14px] font-medium">Assessment</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export all data"
            onPress={() => router.push("/export")}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-line2 bg-surface2 py-3"
          >
            <Database size={16} color="#E9EDF2" />
            <Text className="text-body text-[14px] font-medium">Export</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-heading text-body text-base">Recent clients</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all clients"
            onPress={() => router.push("/clients")}
            className="flex-row items-center gap-0.5"
          >
            <Text className="text-accent text-[13px] font-medium">All</Text>
            <ChevronRight size={14} color="#F5A524" />
          </Pressable>
        </View>
        <View className="gap-2">
          {(recentClients ?? []).slice(0, 3).map((c) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${c.fullName}`}
              onPress={() => router.push(`/client/${c.id}`)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-row items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3"
            >
              <Text className="text-body text-[15px] font-medium" numberOfLines={1}>
                {c.fullName}
              </Text>
              <Text className="text-faint text-[12px] tabular-nums">
                {c.sessionCount} sessions
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text className="font-heading text-body mb-2 text-base">Recent sessions</Text>
        <View className="gap-2">
          {(recentSessions ?? []).map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`Open session for ${s.clientName}`}
              onPress={() => router.push(`/client/${s.clientId}/session/${s.id}`)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-row items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3"
            >
              <View className="flex-1">
                <Text className="text-body text-[15px] font-medium" numberOfLines={1}>
                  {s.clientName}
                </Text>
                <Text className="text-faint text-[12px]">
                  {s.templateName ?? "Session"}
                </Text>
              </View>
              <Text className="text-faint text-[12px] tabular-nums">
                {formatDateShort(s.date)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Backup and sync settings"
        onPress={() => router.push("/sign-in")}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="flex-row items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-3"
      >
        <View className="flex-row items-center gap-2">
          {syncStatus === "disabled" || syncStatus === "signed-out" ? (
            <CloudOff size={16} color="#8E98A5" />
          ) : syncStatus === "error" ? (
            <CloudOff size={16} color="#F87171" />
          ) : (
            <Cloud size={16} color="#34D399" />
          )}
          <View>
            <Text className="text-body text-[14px] font-medium">Backup & sync</Text>
            <Text className="text-faint text-[11px]">
              {syncStatus === "disabled"
                ? "Not configured"
                : syncStatus === "signed-out"
                  ? "Sign in to back up"
                  : syncStatus === "syncing"
                    ? "Syncing…"
                    : syncStatus === "error"
                      ? "Sync error"
                      : lastSyncAt
                        ? `Last sync ${formatDateShort(lastSyncAt)}`
                        : "Up to date"}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color="#5C6672" />
      </Pressable>

      <ClientPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePick}
        title={pickerMode === "session" ? "Start session for" : "New assessment for"}
        onAddNew={() => router.push("/client/new")}
      />
    </ScrollView>
  );
}