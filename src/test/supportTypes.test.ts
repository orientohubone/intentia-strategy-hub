import { describe, it, expect } from "vitest";
import {
  calculateResolutionTime,
  calculateResponseTime,
  isSlaOverdue,
  isSlaDueSoon,
} from "../lib/supportTypes";

describe("supportTypes helpers", () => {
  describe("calculateResolutionTime", () => {
    it("should return null if resolvedAt is missing", () => {
      expect(calculateResolutionTime("2023-01-01T10:00:00Z")).toBeNull();
      expect(calculateResolutionTime("2023-01-01T10:00:00Z", undefined)).toBeNull();
    });

    it("should calculate exact hours correctly", () => {
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T12:00:00Z";
      expect(calculateResolutionTime(start, end)).toBe(2);
    });

    it("should round to the nearest hour (up)", () => {
      // 1 hour 31 minutes -> 2 hours
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T11:31:00Z";
      expect(calculateResolutionTime(start, end)).toBe(2);
    });

    it("should round to the nearest hour (down)", () => {
      // 1 hour 29 minutes -> 1 hour
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T11:29:00Z";
      expect(calculateResolutionTime(start, end)).toBe(1);
    });

    it("should return 0 for less than 30 minutes", () => {
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T10:29:00Z";
      expect(calculateResolutionTime(start, end)).toBe(0);
    });

    it("should handle negative durations (resolved before created)", () => {
      const start = "2023-01-01T12:00:00Z";
      const end = "2023-01-01T10:00:00Z";
      expect(calculateResolutionTime(start, end)).toBe(-2);
    });
  });

  describe("calculateResponseTime", () => {
    it("should return null if firstResponseAt is missing", () => {
      expect(calculateResponseTime("2023-01-01T10:00:00Z")).toBeNull();
    });

    it("should calculate minutes correctly", () => {
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T10:15:00Z";
      expect(calculateResponseTime(start, end)).toBe(15);
    });

    it("should round to nearest minute", () => {
      // 1 minute 31 seconds -> 2 minutes
      const start = "2023-01-01T10:00:00Z";
      const end = "2023-01-01T10:01:31Z";
      expect(calculateResponseTime(start, end)).toBe(2);
    });
  });

  describe("isSlaOverdue", () => {
    it("should return false if no deadline", () => {
      expect(isSlaOverdue(undefined)).toBe(false);
    });

    it("should return true if deadline is in the past", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      expect(isSlaOverdue(pastDate)).toBe(true);
    });

    it("should return false if deadline is in the future", () => {
      const futureDate = new Date(Date.now() + 100000).toISOString();
      expect(isSlaOverdue(futureDate)).toBe(false);
    });
  });

  describe("isSlaDueSoon", () => {
    it("should return false if no deadline", () => {
      expect(isSlaDueSoon(undefined)).toBe(false);
    });

    it("should return true if deadline is within threshold (default 2h)", () => {
      // 1 hour from now
      const soonDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      expect(isSlaDueSoon(soonDate)).toBe(true);
    });

    it("should return false if deadline is outside threshold", () => {
      // 3 hours from now
      const laterDate = new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString();
      expect(isSlaDueSoon(laterDate)).toBe(false);
    });

    it("should return false if deadline has passed (it's overdue, not due soon)", () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      expect(isSlaDueSoon(pastDate)).toBe(false);
    });

    it("should respect custom threshold", () => {
      // 3 hours from now, threshold 4 hours
      const laterDate = new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString();
      expect(isSlaDueSoon(laterDate, 4)).toBe(true);
    });
  });
});
