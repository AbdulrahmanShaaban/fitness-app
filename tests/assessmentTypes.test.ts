import { describe, expect, it } from "vitest";

import { getAssessmentTypeDef, findTestDef, testSummary } from "../lib/constants/assessmentTypes";
import type { AssessmentTest } from "../types";

function test(name: string, fields: Record<string, unknown>): AssessmentTest {
  const stamp = "2026-08-19T08:00:00.000Z";
  return {
    id: "t-1",
    assessmentId: "a-1",
    testName: name,
    fields,
    result: null,
    notes: null,
    isDeleted: false,
    createdAt: stamp,
    updatedAt: stamp,
    syncedAt: null,
  };
}

describe("assessment type config", () => {
  it("resolves every declared type", () => {
    for (const type of ["body", "movement", "cardio", "strength", "mobility", "balance", "custom"]) {
      expect(getAssessmentTypeDef(type as never).type).toBe(type);
    }
  });

  it("falls back to custom for unknown types", () => {
    expect(getAssessmentTypeDef("nope" as never).type).toBe("custom");
  });

  it("finds preset test defs", () => {
    expect(findTestDef("body", "Weight")).not.toBeNull();
    expect(findTestDef("strength", "Bench Press 1RM")).not.toBeNull();
    expect(findTestDef("body", "Not A Test")).toBeNull();
  });
});

describe("testSummary", () => {
  it("joins numeric fields with units", () => {
    expect(testSummary(test("Weight", { weight: 82.5 }), "body")).toBe("82.5 kg");
  });

  it("appends the side", () => {
    expect(testSummary(test("Shoulder Flexion", { value: 170, side: "left" }), "mobility")).toBe(
      "170 deg · left"
    );
  });

  it("handles lift with weight and reps", () => {
    expect(testSummary(test("Back Squat", { weight: 100, reps: 5 }), "movement")).toBe(
      "100 kg · 5"
    );
  });

  it("falls back to result for unknown tests", () => {
    expect(testSummary({ ...test("Mystery", {}), result: "pass" }, "custom")).toBe("pass");
  });

  it("returns empty string when nothing is recorded", () => {
    expect(testSummary(test("Weight", {}), "body")).toBe("");
  });
});