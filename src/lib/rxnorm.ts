// RxNorm (NIH/NLM) free public API — no key required
// https://lhncbc.nlm.nih.gov/RxNav/APIs/

const BASE = "https://rxnav.nlm.nih.gov/REST";

export interface RxSuggestion {
  name: string;
  rxcui?: string;
}

/** Spelling-tolerant suggestion list for a drug name fragment. */
export async function rxnormSuggest(query: string, limit = 8): Promise<RxSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(`${BASE}/spellingsuggestions.json?name=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list: string[] = data?.suggestionGroup?.suggestionList?.suggestion || [];
    return list.slice(0, limit).map(name => ({ name }));
  } catch {
    return [];
  }
}

/** Resolve a drug name → RxCUI + standardized strength/dose-form info. */
export async function rxnormLookup(name: string): Promise<{ rxcui: string | null; strength: string | null; doseForm: string | null }> {
  try {
    const r1 = await fetch(`${BASE}/rxcui.json?name=${encodeURIComponent(name)}&search=2`);
    const d1 = await r1.json();
    const rxcui: string | null = d1?.idGroup?.rxnormId?.[0] || null;
    if (!rxcui) return { rxcui: null, strength: null, doseForm: null };

    // Pull related strength + dose form
    const r2 = await fetch(`${BASE}/rxcui/${rxcui}/properties.json`);
    const d2 = await r2.json();
    const fullName: string = d2?.properties?.name || "";
    // Naive extract: e.g. "Lisinopril 10 MG Oral Tablet"
    const strengthMatch = fullName.match(/(\d+(\.\d+)?\s*(MG|MCG|ML|G|IU|%)\b)/i);
    const formMatch = fullName.match(/(Oral Tablet|Oral Capsule|Injection|Oral Solution|Oral Suspension|Patch|Cream|Ointment|Drop)/i);
    return {
      rxcui,
      strength: strengthMatch ? strengthMatch[1] : null,
      doseForm: formMatch ? formMatch[1] : null,
    };
  } catch {
    return { rxcui: null, strength: null, doseForm: null };
  }
}
