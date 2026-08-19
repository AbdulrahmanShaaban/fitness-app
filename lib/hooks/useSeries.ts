import { useMemo } from "react";

import { getAssessmentTypeDef } from "../constants/assessmentTypes";
import type { Assessment, AssessmentTest } from "../../types";

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface Series {
  key: string;
  label: string;
  unit: string;
  points: SeriesPoint[];
}

export interface TestWithAssessment {
  test: AssessmentTest;
  assessment: Assessment;
}

export function buildSeries(
  rows: TestWithAssessment[],
  assessmentType: Assessment["type"]
): Series[] {
  const byTest = new Map<string, TestWithAssessment[]>();
  for (const row of rows) {
    const list = byTest.get(row.test.testName) ?? [];
    list.push(row);
    byTest.set(row.test.testName, list);
  }

  const series: Series[] = [];
  for (const [testName, entries] of byTest) {
    const def = getAssessmentTypeDef(assessmentType).presets.find(
      (p) => p.name === testName
    );
    const unit = def?.fields.find((f) => f.kind === "number")?.unit ?? "";
    const points: SeriesPoint[] = entries
      .map((e) => {
        const value = extractNumericValue(e.test.fields, def?.fields ?? []);
        return value == null ? null : { date: e.assessment.date, value };
      })
      .filter((p): p is SeriesPoint => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (points.length > 0) {
      series.push({ key: testName, label: testName, unit, points });
    }
  }

  return series.sort((a, b) => a.label.localeCompare(b.label));
}

export function extractNumericValue(
  fields: Record<string, unknown>,
  defs: Array<{ key: string; kind: string; unit?: string }>
): number | null {
  if (defs.length === 0) {
    for (const [k, v] of Object.entries(fields)) {
      if (k === "side") continue;
      if (typeof v === "number") return v;
      const parsed = Number(v);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }
  const field = defs.find((f) => f.kind === "number");
  if (!field) return null;
  const value = fields[field.key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useSeries(
  rows: TestWithAssessment[] | undefined,
  assessmentType: Assessment["type"]
): Series[] {
  return useMemo(() => buildSeries(rows ?? [], assessmentType), [rows, assessmentType]);
}