import { describe, it, expect } from "vitest";
import { computeAdherenceScore, parseMetricTarget, MetricGap, GapStatus } from "../lib/operationalTypes";

describe("parseMetricTarget", () => {
  it("should parse simple integers", () => {
    expect(parseMetricTarget("100")).toEqual({ value: 100, unit: "" });
  });

  it("should parse decimals with dots", () => {
    expect(parseMetricTarget("10.5")).toEqual({ value: 10.5, unit: "" });
  });

  it("should parse decimals with commas", () => {
    expect(parseMetricTarget("10,5")).toEqual({ value: 10.5, unit: "" });
  });

  it("should parse currency values (R$)", () => {
    expect(parseMetricTarget("R$ 100")).toEqual({ value: 100, unit: "R$" });
    expect(parseMetricTarget("R$100")).toEqual({ value: 100, unit: "R$" });
  });

  it("should parse percentage values (%)", () => {
    expect(parseMetricTarget("50%")).toEqual({ value: 50, unit: "%" });
    expect(parseMetricTarget("50 %")).toEqual({ value: 50, unit: "%" });
  });

  it("should parse multiplier values (x)", () => {
    expect(parseMetricTarget("5x")).toEqual({ value: 5, unit: "x" });
    expect(parseMetricTarget("5 x")).toEqual({ value: 5, unit: "x" });
  });

  it("should handle whitespace", () => {
    expect(parseMetricTarget("  100  ")).toEqual({ value: 100, unit: "" });
  });

  it("should return null for empty or null input", () => {
    expect(parseMetricTarget("")).toBeNull();
    // @ts-ignore
    expect(parseMetricTarget(null)).toBeNull();
    // @ts-ignore
    expect(parseMetricTarget(undefined)).toBeNull();
  });

  it("should return null for invalid numeric strings", () => {
    expect(parseMetricTarget("abc")).toBeNull();
    expect(parseMetricTarget("R$ abc")).toBeNull();
  });

  it("should handle mixed separators (current behavior)", () => {
    // Current implementation: replaces ',' with '.' and parses float.
    // "1.234,56" -> "1.234.56" -> parseFloat("1.234.56") -> 1.234
    expect(parseMetricTarget("1.234,56")).toEqual({ value: 1.234, unit: "" });
  });
});

describe("computeAdherenceScore", () => {
  const allMatch = {
    campaignTypeMatch: true,
    funnelStageMatch: true,
    biddingStrategyMatch: true,
  };

  const noMatch = {
    campaignTypeMatch: false,
    funnelStageMatch: false,
    biddingStrategyMatch: false,
  };

  const mockMetricGap = (status: GapStatus): MetricGap => ({
    metric: "test",
    planned: "100",
    actual: 100,
    gap: 0,
    gapPercent: 0,
    status,
    unit: "",
  });

  it("should return 100 for full structure and metric match", () => {
    const gaps = [mockMetricGap("on_track"), mockMetricGap("above")];
    expect(computeAdherenceScore(gaps, allMatch)).toBe(100);
  });

  it("should return 0 for no structure match and critical metrics", () => {
    const gaps = [mockMetricGap("critical")];
    expect(computeAdherenceScore(gaps, noMatch)).toBe(0);
  });

  it("should return 80 for 1/3 structure match and full metric match", () => {
    const partialMatch = {
      campaignTypeMatch: true,
      funnelStageMatch: false,
      biddingStrategyMatch: false,
    };
    const gaps = [mockMetricGap("on_track")];
    // (1/3 * 30) + (1/1 * 70) = 10 + 70 = 80
    expect(computeAdherenceScore(gaps, partialMatch)).toBe(80);
  });

  it("should return 65 for full structure match and mixed metric performance", () => {
    const gaps = [
      mockMetricGap("on_track"), // 1
      mockMetricGap("below"),    // 0.5
      mockMetricGap("critical"), // 0
    ];
    // 30 + (1.5 / 3 * 70) = 30 + 35 = 65
    expect(computeAdherenceScore(gaps, allMatch)).toBe(65);
  });

  it("should return 73 for 2/3 structure match and partial metric performance", () => {
    const partialMatch = {
      campaignTypeMatch: true,
      funnelStageMatch: true,
      biddingStrategyMatch: false,
    };
    const gaps = [
      mockMetricGap("on_track"), // 1
      mockMetricGap("below"),    // 0.5
    ];
    // (2/3 * 30) + (1.5 / 2 * 70) = 20 + 52.5 = 72.5 -> 73
    expect(computeAdherenceScore(gaps, partialMatch)).toBe(73);
  });

  it("should return 30 for full structure match and no metric data", () => {
    const gaps = [mockMetricGap("no_data")];
    expect(computeAdherenceScore(gaps, allMatch)).toBe(30);
  });

  it("should return 30 for full structure match and empty gaps", () => {
    expect(computeAdherenceScore([], allMatch)).toBe(30);
  });
});
