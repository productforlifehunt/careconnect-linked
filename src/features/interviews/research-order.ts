/** Explicit participant codes take precedence over legacy prose identifiers. */
export function researchOrder(title: string): number[] {
  const network = title.match(/\bP\s*-\s*CN\s*(\d+)\s*-\s*([AB])\s*(\d+)/i);
  if (network) return [0, Number(network[1]), network[2]?.toUpperCase() === "A" ? 0 : 1, Number(network[3])];
  const occasional = title.match(/\bP\s*-\s*C\s*(\d+)/i);
  if (occasional) return [1, Number(occasional[1]), 0, 0];
  const legacy = title.match(/\bNetwork\s*(\d+)/i);
  const caregiver = title.match(/\bCaregiver\s*(\d+)/i);
  if (legacy) return [0, Number(legacy[1]), /secondary caregiver/i.test(title) ? 1 : 0, Number(caregiver?.[1] || 0)];
  return [2, 0, 0, 0];
}

export function compareResearchTitles(a: string, b: string): number {
  const left = researchOrder(a), right = researchOrder(b);
  for (let i = 0; i < left.length; i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference) return difference;
  }
  return a.localeCompare(b);
}