// Football seasons run 1 August – 31 July.
export type SeasonRange = { start: string | null; end: string | null };

const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function seasonStartYear(date: Date): number {
  return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export function seasonLabel(startYear: number): string {
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function seasonRange(startYear: number): SeasonRange {
  return { start: `${startYear}-08-01`, end: `${startYear + 1}-07-31` };
}

export function inRange(dateStr: string | null | undefined, range: SeasonRange): boolean {
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  if (range.start && d < range.start) return false;
  if (range.end && d > range.end) return false;
  return true;
}
