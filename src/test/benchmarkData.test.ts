import { describe, it, expect } from "vitest";
import { averageBenchmarkRatio, BenchmarkSnapshot } from "../lib/benchmarkData";

// Helper to create a partial snapshot for testing
// We only really care about the 'ratio' property for this function,
// but we need to satisfy the type definition.
function createSnapshot(ratio: number): BenchmarkSnapshot {
  return {
    id: "test-id",
    label: "Test Label",
    description: "Test Description",
    display: "Test Display",
    ratio: ratio,
    niche_id: "test-niche",
    fetched_at: null,
  } as BenchmarkSnapshot;
}

describe("averageBenchmarkRatio", () => {
  it("should return 0 for an empty array", () => {
    expect(averageBenchmarkRatio([])).toBe(0);
  });

  it("should return the ratio of a single snapshot", () => {
    const snapshots = [createSnapshot(5)];
    expect(averageBenchmarkRatio(snapshots)).toBe(5);
  });

  it("should calculate the average correctly for multiple snapshots", () => {
    const snapshots = [
      createSnapshot(2),
      createSnapshot(4),
      createSnapshot(6),
    ];
    // (2 + 4 + 6) / 3 = 4
    expect(averageBenchmarkRatio(snapshots)).toBe(4);
  });

  it("should handle floating point numbers and round to 2 decimal places", () => {
    const snapshots = [
      createSnapshot(1),
      createSnapshot(2),
    ];
    // (1 + 2) / 2 = 1.5
    expect(averageBenchmarkRatio(snapshots)).toBe(1.5);

    const snapshots2 = [
      createSnapshot(1),
      createSnapshot(1),
      createSnapshot(2),
    ];
    // (1 + 1 + 2) / 3 = 1.3333... -> 1.33
    expect(averageBenchmarkRatio(snapshots2)).toBe(1.33);
  });

  it("should handle mixed ratios", () => {
    const snapshots = [
      createSnapshot(0),
      createSnapshot(10),
    ];
    // (0 + 10) / 2 = 5
    expect(averageBenchmarkRatio(snapshots)).toBe(5);
  });
});
