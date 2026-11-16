import { describe, it, expect } from "vitest";
import { seasonStartYear, seasonRange, seasonLabel, inRange } from "./seasons";

describe("football seasons (1 Aug cut-off)", () => {
  it("31 July belongs to previous season", () => {
    expect(seasonStartYear(new Date(2026, 6, 31))).toBe(2025);
  });
  it("1 August starts new season", () => {
    expect(seasonStartYear(new Date(2026, 7, 1))).toBe(2026);
  });
  it("range and label", () => {
    expect(seasonRange(2026)).toEqual({ start: "2026-08-01", end: "2027-07-31" });
    expect(seasonLabel(2026)).toBe("2026/27");
    expect(inRange("2026-07-31", seasonRange(2026))).toBe(false);
    expect(inRange("2027-07-31", seasonRange(2026))).toBe(true);
  });
});
