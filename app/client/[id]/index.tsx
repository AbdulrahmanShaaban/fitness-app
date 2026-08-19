import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { ClientAssessmentsSection } from "@/components/sections/ClientAssessmentsSection";
import { ClientOverviewSection } from "@/components/sections/ClientOverviewSection";
import { ClientPhotosSection } from "@/components/sections/ClientPhotosSection";
import { ClientProgressSection } from "@/components/sections/ClientProgressSection";
import { ClientSessionsSection } from "@/components/sections/ClientSessionsSection";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useClient, useDeleteClient } from "@/lib/hooks/useClients";

const SEGMENTS = [
  { key: "overview", label: "Overview" },
  { key: "sessions", label: "Sessions" },
  { key: "assessments", label: "Assessments" },
  { key: "progress", label: "Progress" },
  { key: "photos", label: "Photos" },
];

export default function ClientProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client, isLoading } = useClient(id);
  const deleteClient = useDeleteClient();
  const [segment, setSegment] = useState("overview");

  const handleDelete = useCallback(async () => {
    await deleteClient.mutateAsync(id);
    router.back();
  }, [deleteClient, id, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator color="#F5A524" />
      </View>
    );
  }

  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-ink px-8">
        <Text className="text-body text-base">Client not found.</Text>
      </View>
    );
  }

  const initials = client.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View className="flex-1 bg-ink">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center gap-3">
          <View
            accessible={false}
            className="h-14 w-14 items-center justify-center rounded-full bg-accentDim"
          >
            <Text className="text-accent text-lg font-bold">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-body text-lg font-semibold" numberOfLines={1}>
              {client.fullName}
            </Text>
            <Text className="text-faint text-[13px]">
              {client.age != null ? `${client.age} yrs` : "— age —"}
              {client.currentWeightKg != null ? ` · ${client.currentWeightKg} kg` : ""}
              {client.heightCm != null ? ` · ${client.heightCm} cm` : ""}
            </Text>
          </View>
        </View>

        <SegmentedControl
          accessibilityLabel="Client profile sections"
          options={SEGMENTS}
          value={segment}
          onChange={setSegment}
        />

        {segment === "overview" ? (
          <ClientOverviewSection client={client} onDelete={handleDelete} />
        ) : null}
        {segment === "sessions" ? (
          <ClientSessionsSection
            clientId={id}
            onNewSession={() => router.push(`/session/new?clientId=${id}`)}
          />
        ) : null}
        {segment === "assessments" ? (
          <ClientAssessmentsSection
            clientId={id}
            onNewAssessment={() => router.push(`/client/${id}/assessment/new`)}
          />
        ) : null}
        {segment === "progress" ? <ClientProgressSection clientId={id} /> : null}
        {segment === "photos" ? <ClientPhotosSection clientId={id} /> : null}
      </ScrollView>
    </View>
  );
}