import { useRouter } from "expo-router";
import { Database, FileJson } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { exportAllRows, exportRowCounts } from "../lib/utils/exportAll";
import { getErrorMessage } from "../lib/utils/errors";

export default function ExportScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      setCounts(await exportRowCounts());
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const uri = await exportAllRows();
      Alert.alert("Export complete", `Your data was exported.\n${uri}`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Export failed", getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const labels: Record<string, string> = {
    clients: "Clients",
    sessions: "Sessions",
    sessionExercises: "Session exercises",
    sets: "Sets",
    exercises: "Exercises",
    assessments: "Assessments",
    assessmentTests: "Assessment tests",
    clientPhotos: "Photos",
  };

  return (
    <ScrollView className="flex-1 bg-ink" contentContainerClassName="p-4 gap-4">
      <View className="flex-row items-center gap-2">
        <View accessible={false} className="h-10 w-10 items-center justify-center rounded-lg bg-accentDim">
          <Database size={18} color="#F5A524" />
        </View>
        <View className="flex-1">
          <Text className="text-body text-base font-semibold">Export all data</Text>
          <Text className="text-faint text-[12px]">
            Full JSON backup, independent of cloud sync
          </Text>
        </View>
      </View>

      {counts ? (
        <Card>
          <Text className="mb-2 text-faint text-[12px] font-medium uppercase tracking-wide">
            What will be exported
          </Text>
          <View className="gap-1.5">
            {Object.entries(labels).map(([key, label]) => (
              <View key={key} className="flex-row items-center justify-between">
                <Text className="text-muted text-[13px]">{label}</Text>
                <Text className="text-body text-[13px] font-semibold tabular-nums">
                  {counts[key] ?? 0}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Button
        label="Export as JSON"
        onPress={handleExport}
        size="lg"
        icon={<FileJson size={16} color="#0B0E12" />}
        loading={exporting}
      />

      <Text className="text-faint text-[12px] leading-5">
        This creates a complete JSON copy of the local database and opens the share sheet so you
        can save it to Files, email it, or back it up anywhere. Photos are referenced by their
        local file paths.
      </Text>
    </ScrollView>
  );
}