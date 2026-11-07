/** Old line-only positions need corroborating visible text: a line number alone can move. */
export function matchingLegacyLabel(saved: string, current: string): boolean {
  const normal = (label: string) => label.replace(/^<[^>]+>\s*/, '').split(' · ')[0]!
    .toLocaleLowerCase().replace(/[\d\s\p{P}\p{S}]+/gu, '');
  const a = normal(saved); const b = normal(current);
  return a.length >= 2 && a === b;
}
