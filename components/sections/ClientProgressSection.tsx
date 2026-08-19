import { TrendingDown, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAllTests } from "../../lib/hooks/useAssessments";
import { useSeries } from "../../lib/hooks/useSeries";
import { formatDate } from "../../lib/utils/date";
import { ProgressChart } from "../shared/ProgressChart";
import { EmptyState } from "../ui/EmptyState";
import { TabularText } from "../ui/TabularText";

interface ClientProgressSectionProps {
  clientId: string;
}

export function ClientProgressSection({ clientId }: ClientProgressSectionProps) {
  const { data: rows } = useAllTests(clientId);
  const [selected, setSelected] = useState<string | null>(null);

  const series = useSeries(rows, "body");
  const active = series.find((s) => s.key === selected) ?? series[0];

  if (!active) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No progress data"
        hint="Body measurements and strength tests will chart here as you log assessments."
      />
    );
  }

  const points = active.points;
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  const improved = delta < 0;
  const isBodyComposition = active.label === "Weight" || active.label === "Waist" || active.label === "Body Fat";

  return (
    <View className="gap-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-1"
        accessibilityLabel="Chart series picker"
      >
        {series.map((s) => (
          <Pressable
            key={s.key}
            accessibilityRole="button"
            accessibilityState={{ selected: s.key === active.key }}
            accessibilityLabel={`Chart series ${s.label}`}
            onPress={() => setSelected(s.key)}
            className={`rounded-full border px-3.5 py-1.5 ${
              s.key === active.key
                ? "border-accent bg-accentDim"
                : "border-line2 bg-surface2"
            }`}
          >
            <Text
              className={`text-[13px] font-medium ${
                s.key === active.key ? "text-accent" : "text-muted"
              }`}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="rounded-lg border border-line bg-surface p-4">
        <ProgressChart points={active.points} unit={active.unit} />
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 rounded-lg border border-line bg-surface p-3.5">
          <Text className="text-faint text-[11px] font-medium uppercase tracking-wide">First</Text>
          <TabularText className="mt-1 text-body text-lg font-semibold">
            {first.value}
            {active.unit ? <Text className="text-muted text-[12px]"> {active.unit}</Text> : null}
          </TabularText>
          <Text className="mt-0.5 text-faint text-[11px]">{formatDate(first.date)}</Text>
        </View>
        <View className="flex-1 rounded-lg border border-line bg-surface p-3.5">
          <Text className="text-faint text-[11px] font-medium uppercase tracking-wide">Latest</Text>
          <TabularText className="mt-1 text-body text-lg font-semibold">
            {last.value}
            {active.unit ? <Text className="text-muted text-[12px]"> {active.unit}</Text> : null}
          </TabularText>
          <Text className="mt-0.5 text-faint text-[11px]">{formatDate(last.date)}</Text>
        </View>
        <View className="flex-1 rounded-lg border border-line bg-surface p-3.5">
          <Text className="text-faint text-[11px] font-medium uppercase tracking-wide">Change</Text>
          <View className="mt-1 flex-row items-center gap-1">
            {delta > 0 ? (
              <TrendingUp size={15} color={isBodyComposition ? "#F87171" : "#34D399"} />
            ) : delta < 0 ? (
              <TrendingDown size={15} color={isBodyComposition ? "#34D399" : "#F87171"} />
            ) : null}
            <TabularText
              className={`text-lg font-semibold ${
                delta > 0
                  ? isBodyComposition
                    ? "text-danger"
                    : "text-positive"
                  : delta < 0
                    ? isBodyComposition
                      ? "text-positive"
                      : "text-danger"
                    : "text-muted"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </TabularText>
          </View>
          <Text className="mt-0.5 text-faint text-[11px]">overall</Text>
        </View>
      </View>
    </View>
  );
}