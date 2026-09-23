/**
 * The people a participant mentions in their hourly logs.
 *
 * Each person is one row in the JetEngine table esm_log_person (CCT 314):
 *   a01 person name, a02 relationship to caregiver, a03 what this person does,
 *   a04 notes.
 *
 * Links are JetEngine relations only — never a hand-made id column:
 *   REL 316  One user can have many people
 *   REL 308  One hourly log can have many people
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";

/** The REST slug JetEngine registered in the GUI — odd looking, but live. */
export const PERSON_CCT = "esm_log_personesm_log_person";
export const PERSON_REL = { user: 316, hourlyLog: 308 } as const;

export interface EsmPerson {
  id: string;
  name: string;
  relationship: string;
  role: string;
  notes: string;
}

const CACHE_KEY = "esm:people";

const readCache = (): EsmPerson[] => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]") as EsmPerson[];
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

/** Everyone this participant has named so far, newest first. */
export const cachedPeople = (): EsmPerson[] => readCache();

export const personName = (id: string): string =>
  id === "just_me" ? "Just me" : readCache().find((p) => p.id === id)?.name ?? id;

const toPerson = (row: Record<string, unknown>): EsmPerson => ({
  id: String(row._ID ?? row.id ?? ""),
  name: String(row.a01 ?? ""),
  relationship: String(row.a02 ?? ""),
  role: String(row.a03 ?? ""),
  notes: String(row.a04 ?? ""),
});

/** Loads this participant's people from the study backend and refreshes the cache. */
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
      .map(toPerson)
      .reverse();
    writeCache(people);
    return people;
  } catch {
    return readCache();
  }
}

/** Adds one person and links them to the signed-in participant. */
export async function createPerson(input: Omit<EsmPerson, "id">): Promise<EsmPerson> {
  const userId = getCurrentUserIdNumber();
  if (!userId) throw new Error("Sign in first so the people you name are saved to the study.");

  const created = await wordpressCCTFetch<any>(PERSON_CCT, {
    method: "POST",
    body: {
      a01: input.name,
      a02: input.relationship,
      a03: input.role,
      a04: input.notes,
    },
  });
  const rowId = created?.item_id ?? created?.id ?? created?._ID;
  if (!rowId) throw new Error("The study people table did not return a row id.");

  await wordpressFetch(`jet-rel/${PERSON_REL.user}`, {
    method: "POST",
    body: {
      parent_id: String(userId),
      child_id: String(rowId),
      context: "child_object",
      store_items_type: "update",
    },
  });

  const person: EsmPerson = { ...input, id: String(rowId) };
  writeCache([person, ...readCache()]);
  return person;
}

/** Links the people chosen on an hourly log to that log row. */
export async function linkPeopleToLog(logRowId: string, personIds: string[]): Promise<void> {
  for (const personId of personIds.filter((id) => id !== "just_me")) {
    await wordpressFetch(`jet-rel/${PERSON_REL.hourlyLog}`, {
      method: "POST",
      body: {
        parent_id: String(logRowId),
        child_id: String(personId),
        context: "child_object",
        store_items_type: "update",
      },
    });
  }
}
