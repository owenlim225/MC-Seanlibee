export function barWidthPercents(counts: readonly number[]): number[] {
  const maxCount = counts.length === 0 ? 0 : Math.max(0, ...counts);
  const denominator = Math.max(1, maxCount);
  return counts.map((n) => (Math.max(0, n) / denominator) * 100);
}
