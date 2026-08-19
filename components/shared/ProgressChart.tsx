import { Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

import { formatDateShort } from "../../lib/utils/date";
import { TabularText } from "../ui/TabularText";

export interface ChartPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  points: ChartPoint[];
  color?: string;
  unit?: string;
  height?: number;
}

export function ProgressChart({ points, color = "#F5A524", unit = "", height = 150 }: ProgressChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 64, 420);
  const chartHeight = height;

  if (points.length === 0) {
    return (
      <View className="h-[150px] items-center justify-center">
        <Text className="text-faint text-[13px]">No data yet</Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 18;
  const padX = 10;

  const xFor = (i: number) =>
    padX + (i * (chartWidth - padX * 2)) / Math.max(points.length - 1, 1);
  const yFor = (v: number) =>
    chartHeight - padY - ((v - min) / range) * (chartHeight - padY * 2);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p.value)}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];

  return (
    <View className="gap-2">
      <View className="flex-row items-end justify-between px-1">
        <TabularText className="text-body text-2xl font-bold">
          {last.value}
          {unit ? <Text className="text-muted text-[14px] font-medium"> {unit}</Text> : null}
        </TabularText>
        <Text className="text-faint text-[12px]">
          {formatDateShort(last.date)}
        </Text>
      </View>
      <Svg width={chartWidth} height={chartHeight} accessibilityLabel="Progress chart">
        <Line
          x1={padX}
          y1={yFor(max)}
          x2={chartWidth - padX}
          y2={yFor(max)}
          stroke="#252C36"
          strokeWidth={1}
        />
        <Line
          x1={padX}
          y1={yFor(min)}
          x2={chartWidth - padX}
          y2={yFor(min)}
          stroke="#252C36"
          strokeWidth={1}
        />
        <Polyline points={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={p.date + i} cx={xFor(i)} cy={yFor(p.value)} r={3.5} fill={color} />
        ))}
        <SvgText
          x={padX}
          y={chartHeight - 4}
          fontSize={10}
          fill="#5C6672"
          textAnchor="start"
        >
          {formatDateShort(first.date)}
        </SvgText>
        <SvgText
          x={chartWidth - padX}
          y={chartHeight - 4}
          fontSize={10}
          fill="#5C6672"
          textAnchor="end"
        >
          {formatDateShort(last.date)}
        </SvgText>
      </Svg>
    </View>
  );
}