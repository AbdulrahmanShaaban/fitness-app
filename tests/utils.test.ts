import { describe, expect, it } from "vitest";

import { buildExportBundle, serializeExportBundle } from "../lib/utils/exportBundle";
import { formatDate, formatDateShort, todayIso } from "../lib/utils/date";
import { clampNumber, formatReps, formatWeight } from "../lib/utils/format";

describe("buildExportBundle", () => {
  it("tags the bundle with version and timestamp", () => {
    const bundle = buildExportBundle(
      {
        clients: [],
        sessions: [],
        sessionExercises: [],
        sets: [],
        exercises: [],
        assessments: [],
        assessmentTests: [],
        clientPhotos: [],
      },
      "2026-08-19T08:00:00.000Z"
    );
    expect(bundle.version).toBe(1);
    expect(bundle.exportedAt).toBe("2026-08-19T08:00:00.000Z");
    expect(bundle.clients).toEqual([]);
  });

  it("serializes deterministically", () => {
    const bundle = buildExportBundle(
      {
        clients: [{ id: "c1" } as never],
        sessions: [],
        sessionExercises: [],
        sets: [],
        exercises: [],
        assessments: [],
        assessmentTests: [],
        clientPhotos: [],
      },
      "2026-08-19T08:00:00.000Z"
    );
    const json = serializeExportBundle(bundle);
    expect(JSON.parse(json).clients[0].id).toBe("c1");
  });
});

describe("dates", () => {
  it("formats ISO dates", () => {
    expect(formatDate("2026-08-19")).toBe("19 Aug 2026");
    expect(formatDate("2026-08-19T08:00:00.000Z")).toBe("19 Aug 2026");
    expect(formatDateShort("2026-08-19")).toBe("19 Aug");
  });

  it("returns today in YYYY-MM-DD", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("format utils", () => {
  it("formats weight trimming trailing zeros", () => {
    expect(formatWeight(60)).toBe("60");
    expect(formatWeight(62.5)).toBe("62.5");
    expect(formatWeight(null)).toBe("—");
  });

  it("formats reps", () => {
    expect(formatReps(10)).toBe("10");
    expect(formatReps(undefined)).toBe("—");
  });

  it("clamps numbers", () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-3, 0, 10)).toBe(0);
    expect(clampNumber(99, 0, 10)).toBe(10);
    expect(clampNumber(Number.NaN, 2, 10)).toBe(2);
  });
});