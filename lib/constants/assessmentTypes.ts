import type { AssessmentTest, AssessmentType } from "../../types";

export type FieldKind = "number" | "select" | "text";

export interface TestFieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
  options?: string[];
  side?: boolean;
}

export interface TestDef {
  name: string;
  fields: TestFieldDef[];
}

export interface AssessmentTypeDef {
  type: AssessmentType;
  label: string;
  icon: string;
  description: string;
  presets: TestDef[];
  allowsCustomTests: boolean;
}

export const ASSESSMENT_TYPES: AssessmentTypeDef[] = [
  {
    type: "body",
    label: "Body",
    icon: "person-standing",
    description: "Weight, girths and body composition",
    allowsCustomTests: true,
    presets: [
      {
        name: "Weight",
        fields: [{ key: "weight", label: "Weight", kind: "number", unit: "kg", step: 0.5, precision: 1, min: 20, max: 300 }],
      },
      {
        name: "Waist",
        fields: [{ key: "value", label: "Waist", kind: "number", unit: "cm", step: 0.5, precision: 1, min: 40, max: 200 }],
      },
      {
        name: "Hips",
        fields: [{ key: "value", label: "Hips", kind: "number", unit: "cm", step: 0.5, precision: 1, min: 40, max: 200 }],
      },
      {
        name: "Chest",
        fields: [{ key: "value", label: "Chest", kind: "number", unit: "cm", step: 0.5, precision: 1, min: 40, max: 200 }],
      },
      {
        name: "Body Fat",
        fields: [{ key: "value", label: "Body Fat", kind: "number", unit: "%", step: 0.5, precision: 1, min: 2, max: 70 }],
      },
      {
        name: "Resting HR",
        fields: [{ key: "value", label: "Resting HR", kind: "number", unit: "bpm", step: 1, min: 30, max: 200 }],
      },
    ],
  },
  {
    type: "movement",
    label: "Movement",
    icon: "move",
    description: "Lift patterns with weight and reps",
    allowsCustomTests: true,
    presets: [
      {
        name: "Back Squat",
        fields: [
          { key: "weight", label: "Weight", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 },
          { key: "reps", label: "Reps", kind: "number", step: 1, min: 0, max: 100 },
        ],
      },
      {
        name: "Bench Press",
        fields: [
          { key: "weight", label: "Weight", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 },
          { key: "reps", label: "Reps", kind: "number", step: 1, min: 0, max: 100 },
        ],
      },
      {
        name: "Deadlift",
        fields: [
          { key: "weight", label: "Weight", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 },
          { key: "reps", label: "Reps", kind: "number", step: 1, min: 0, max: 100 },
        ],
      },
      {
        name: "Overhead Press",
        fields: [
          { key: "weight", label: "Weight", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 400 },
          { key: "reps", label: "Reps", kind: "number", step: 1, min: 0, max: 100 },
        ],
      },
      {
        name: "Pull-Up",
        fields: [{ key: "reps", label: "Reps", kind: "number", step: 1, min: 0, max: 100 }],
      },
    ],
  },
  {
    type: "cardio",
    label: "Cardio",
    icon: "heart-pulse",
    description: "VO2max, run times and heart rate",
    allowsCustomTests: true,
    presets: [
      {
        name: "VO2max",
        fields: [{ key: "value", label: "VO2max", kind: "number", unit: "ml/kg/min", step: 0.5, precision: 1, min: 10, max: 100 }],
      },
      {
        name: "1.5km Run",
        fields: [{ key: "time", label: "Time", kind: "text", unit: "mm:ss" }],
      },
      {
        name: "5km Run",
        fields: [{ key: "time", label: "Time", kind: "text", unit: "mm:ss" }],
      },
      {
        name: "Cooper Test",
        fields: [{ key: "distance", label: "Distance", kind: "number", unit: "m", step: 10, min: 0, max: 10000 }],
      },
    ],
  },
  {
    type: "strength",
    label: "Strength",
    icon: "dumbbell",
    description: "Max-effort lifts",
    allowsCustomTests: true,
    presets: [
      {
        name: "Bench Press 1RM",
        fields: [{ key: "weight", label: "1RM", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 }],
      },
      {
        name: "Back Squat 1RM",
        fields: [{ key: "weight", label: "1RM", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 }],
      },
      {
        name: "Deadlift 1RM",
        fields: [{ key: "weight", label: "1RM", kind: "number", unit: "kg", step: 2.5, precision: 1, min: 0, max: 600 }],
      },
      {
        name: "Pull-Up Max",
        fields: [{ key: "reps", label: "Max reps", kind: "number", step: 1, min: 0, max: 100 }],
      },
    ],
  },
  {
    type: "mobility",
    label: "Mobility",
    icon: "stretch-horizontal",
    description: "Range of motion tests",
    allowsCustomTests: true,
    presets: [
      {
        name: "Shoulder Flexion",
        fields: [{ key: "value", label: "ROM", kind: "number", unit: "deg", step: 5, min: 0, max: 360, side: true }],
      },
      {
        name: "Hip Flexion",
        fields: [{ key: "value", label: "ROM", kind: "number", unit: "deg", step: 5, min: 0, max: 360, side: true }],
      },
      {
        name: "Sit-and-Reach",
        fields: [{ key: "value", label: "Reach", kind: "number", unit: "cm", step: 0.5, precision: 1, min: -50, max: 100 }],
      },
      {
        name: "Overhead Squat",
        fields: [{ key: "observation", label: "Observation", kind: "text" }],
      },
    ],
  },
  {
    type: "balance",
    label: "Balance",
    icon: "scale",
    description: "Stability and balance tests",
    allowsCustomTests: true,
    presets: [
      {
        name: "Single-Leg Stance",
        fields: [{ key: "seconds", label: "Hold", kind: "number", unit: "s", step: 1, min: 0, max: 300, side: true }],
      },
      {
        name: "Tandem Stance",
        fields: [{ key: "seconds", label: "Hold", kind: "number", unit: "s", step: 1, min: 0, max: 300 }],
      },
      {
        name: "Balance Error Score",
        fields: [{ key: "score", label: "Errors", kind: "number", step: 1, min: 0, max: 10 }],
      },
    ],
  },
  {
    type: "custom",
    label: "Custom",
    icon: "sliders-horizontal",
    description: "Any test you define yourself",
    allowsCustomTests: true,
    presets: [],
  },
];

const TYPE_INDEX: Record<string, AssessmentTypeDef> = Object.fromEntries(
  ASSESSMENT_TYPES.map((t) => [t.type, t])
);

export function getAssessmentTypeDef(type: AssessmentType): AssessmentTypeDef {
  return TYPE_INDEX[type] ?? TYPE_INDEX.custom;
}

export function findTestDef(type: AssessmentType, testName: string): TestDef | null {
  const def = getAssessmentTypeDef(type);
  return def.presets.find((p) => p.name === testName) ?? null;
}

export function testSummary(test: AssessmentTest, assessmentType: AssessmentType): string {
  const def = findTestDef(assessmentType, test.testName);
  if (!def) return test.result ?? "";
  const parts: string[] = [];
  for (const f of def.fields) {
    const value = (test.fields as Record<string, unknown>)?.[f.key];
    if (value === undefined || value === null || value === "") continue;
    if (f.kind === "number") {
      parts.push(`${value}${f.unit ? ` ${f.unit}` : ""}`);
    } else {
      parts.push(String(value));
    }
  }
  const side = (test.fields as Record<string, unknown>)?.side;
  if (side) parts.push(String(side));
  if (parts.length === 0) return test.result ?? "";
  return parts.join(" · ");
}