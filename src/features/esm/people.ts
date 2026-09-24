/**
 * The other caregivers a participant names in their hourly logs.
 *
 * CCT320 (slug esm_log_person_v2) has one column in use: a01 person name.
 * Optional extra details (questions 2.1, CCT318 a134–a143) go into a new CCT318
 * row for that person, linked by REL321 (CCT320 → CCT318, one-to-one).
 *
 * Links are JetEngine relations only:
 *   REL316  user → CCT320 (people this participant has added)
 *   REL308  CCT319 hourly log → CCT320 (people involved in that entry)
 *   REL321  CCT320 person → CCT318 (that person's optional details)
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { ESM_SPEC } from "./spec.generated";

export const PERSON_CCT = "esm_log_person_v2";
export const SCREENING_CCT = "esm_screening_v2";
export const PERSON_REL = { user: 316, hourlyLog: 308, details: 321 } as const;

export interface EsmPerson {
  id: string;
  name: string;
}

const CACHE_KEY = "esm:people";

const readCache = (): EsmPerson[] => {
  try {
    return (JSON.parse(localStorage.getItem(CACHE_KEY) || "[]") as EsmPerson[]).map((p) => ({
      id: p.id,
      name: p.name,
    }));
  } catch {
    return [];
  }
};

const writeCache = (people: EsmPerson[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(people));
  } catch {
    /* storage blocked — the screen still works for this session */
  }
};

export const cachedPeople = (): EsmPerson[] => readCache();

export const personName = (id: string): string =>
  id === "just_me" ? "Just me" : readCache().find((p) => p.id === id)?.name ?? id;

const link = (rel: number, parent: string, child: string) =>
  wordpressFetch(`jet-rel/${rel}`, {
    method: "POST",
    // "append" keeps existing links: one log can list many people, one person many logs.
    body: { parent_id: parent, child_id: child, context: "child_object", store_items_type: "append" },
  });

const rowIdOf = (created: any) => created?.item_id ?? created?.id ?? created?._ID;

/** Loads this participant's people (REL316) and refreshes the cache. */
export async function fetchMyPeople(): Promise<EsmPerson[]> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return readCache();
  try {
    const links = await wordpressFetch<any[]>(`jet-rel/${PERSON_REL.user}/children/${userId}`);
    const ids = Array.isArray(links) ? links.map((l) => String(l.child_object_id)) : [];
    if (ids.length === 0) {
      writeCache([]);
      return [];
    }
    const rows = await wordpressCCTFetch<Record<string, unknown>[]>(PERSON_CCT);
    const people = (Array.isArray(rows) ? rows : [])
      .filter((r) => ids.includes(String(r._ID ?? r.id)))
      .map((r) => ({ id: String(r._ID ?? r.id ?? ""), name: String(r.a01 ?? "") }))
      .reverse();
    writeCache(people);
    return people;
  } catch {
    return readCache();
  }
}

/** Adds one person (CCT320 a01 only) and links them to the participant via REL316. */
export async function createPerson(name: string): Promise<EsmPerson> {
  const userId = getCurrentUserIdNumber();
  if (!userId) throw new Error("Sign in first so the people you name are saved to the study.");

  const created = await wordpressCCTFetch<any>(PERSON_CCT, { method: "POST", body: { a01: name } });
  const rowId = rowIdOf(created);
  if (!rowId) throw new Error("The study people table did not return a row id.");
  await link(PERSON_REL.user, String(userId), String(rowId));

  const person: EsmPerson = { id: String(rowId), name };
  writeCache([person, ...readCache()]);
  return person;
}

/**
 * Saves the optional 2.1 details for one person: a new CCT318 row holding only
 * a134–a143, linked to the person through REL321. The name stays in CCT320 a01.
 */
export async function savePersonDetails(personId: string, answers: Record<string, unknown>): Promise<string> {
  const body: Record<string, string> = {};
  for (const item of ESM_SPEC) {
    if (item.cct !== "318" || !item.code.startsWith("2.1")) continue;
    const value = answers[item.id];
    if (value === undefined || value === null || value === "") continue;
    body[item.column] = Array.isArray(value) ? value.join(",") : String(value);
  }
  const created = await wordpressCCTFetch<any>(SCREENING_CCT, { method: "POST", body });
  const rowId = rowIdOf(created);
  if (!rowId) throw new Error("The screening table did not return a row id.");
  await link(PERSON_REL.details, String(personId), String(rowId));
  return String(rowId);
}

/** Links the people chosen on an hourly log to that log row (REL308). */
export async function linkPeopleToLog(logRowId: string, personIds: string[]): Promise<void> {
  for (const personId of personIds.filter((id) => id !== "just_me")) {
    await link(PERSON_REL.hourlyLog, String(logRowId), String(personId));
  }
}
