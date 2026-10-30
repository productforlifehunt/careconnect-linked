import { FAMILY_VOICE_CCT as C, FAMILY_VOICE_RELATION as REL, FAMILY_VOICE_STATE as STATE, type SavedFamilyVoice } from "./schema";
import { WP, R } from "@/integrations/wp-schema";
import { decodeRel219Status } from "@/features/cared-ones/rel219-meta";

const BASE = "https://app.challenged-dementia.com/afresh/wp-json";
type Row = Record<string, unknown> & { child_object_id?: unknown; parent_object_id?: unknown; meta?: unknown; _ID?: unknown; item_id?: unknown; cct_created?: unknown };
export async function verifiedActor(token: string) {
  if (!token) throw new Error("Please sign in. / 请先登录。");
  const res = await fetch(`${BASE}/wp/v2/users/me?context=edit`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Session could not be verified. / 无法验证登录状态。");
  const user = await res.json() as { id?: number; name?: string };
  if (!user.id) throw new Error("Invalid WordPress identity");
  return { id: String(user.id), name: user.name || "" };
}
export function wordpressStore(user: string, password: string) {
  if (!user || !password) throw new Error("Voice storage is not configured");
  const auth = `Basic ${btoa(`${user}:${password}`)}`;
  const request = async (path: string, method = "GET", body?: unknown): Promise<unknown> => {
    const res = await fetch(`${BASE}/${path}`, { method, headers: { Authorization: auth, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!res.ok) throw new Error(`Voice storage failed [${res.status}]`);
    return res.json();
  };
  const relations = async (relation: number, side: "children" | "parents", id: string): Promise<Row[]> => {
    const result = await request(`jet-rel/${relation}/${side}/${id}`);
    if (!Array.isArray(result)) throw new Error("Voice relationships could not be read");
    return result as Row[];
  };
  const access = async (actor: string, person: string) => {
    if (actor === person) return;
    const links = await relations(R.userCaredOnes, "children", actor);
    if (!links.some((r) => String(r.child_object_id) === person && decodeRel219Status(r.meta) === "accepted")) throw new Error("No access to this person's voices. / 无权访问此人的亲友声音。");
  };
  const get = async (id: string) => await request(`jet-cct/${C.slug}/${id}`) as Row;
  const owned = async (actor: string, id: string, person?: string) => {
    const links = await relations(REL, "parents", id);
    if (links.length !== 1) throw new Error("Voice has no unique cared-one relationship");
    const owner = String(links[0]?.parent_object_id || "");
    if (person && person !== owner) throw new Error("Voice belongs to a different cared one");
    await access(actor, owner);
    return { row: await get(id), person: owner };
  };
  const map = (row: Row, person: string, name = ""): SavedFamilyVoice => ({ id: String(row._ID), voiceId: String(row[C.fields.voiceId] || ""), label: String(row[C.fields.label] || ""), model: String(row[C.fields.model] || ""), state: String(row[C.fields.state] || STATE.pending), error: String(row[C.fields.error] || ""), audioSaved: !!row[C.fields.audioPath], caredOneId: person, caredOneName: name, createdAt: String(row.cct_created || "").replace(" ", "T") });
  const list = async (actor: string, person?: string) => {
    const people = person ? [person] : [actor, ...(await relations(R.userCaredOnes, "children", actor)).filter((r) => decodeRel219Status(r.meta) === "accepted").map((r) => String(r.child_object_id))];
    return (await Promise.all([...new Set(people)].map(async (p) => {
      await access(actor, p);
      const links = await relations(REL, "children", p);
      let name = "";
      const profileLinks = await relations(152, "children", p);
      const profileId = String(profileLinks[0]?.child_object_id || "");
      if (profileId) { const profile = await request(`jet-cct/${WP.cct["151"].slug}/${profileId}`) as Row; name = String(profile[WP.cct["151"].f["USER_NAME_FOR_CHALLENGED"] || ""] || ""); }
      return Promise.all(links.map(async (r) => map(await get(String(r.child_object_id)), p, name)));
    }))).flat();
  };
  const update = (id: string, body: Row) => request(`jet-cct/${C.slug}/${id}`, "POST", body);
  const create = async (actor: string, person: string, body: Row) => {
    await access(actor, person);
    const result = await request(`jet-cct/${C.slug}`, "POST", { ...body, cct_author_id: Number(actor), cct_status: "publish" });
    const id = String(typeof result === "number" || typeof result === "string" ? result : (result as Row)?._ID || (result as Row)?.item_id || "");
    if (!/^\d+$/.test(id)) throw new Error("Voice record ID was not returned");
    await request(`jet-rel/${REL}`, "POST", { parent_id: Number(person), child_id: Number(id), context: "child", store_items_type: "update" });
    await owned(actor, id, person);
    return id;
  };
  const remove = async (person: string, id: string) => {
    await request(`jet-cct/${C.slug}/${id}`, "DELETE");
    await request(`jet-rel/${REL}`, "POST", { parent_id: Number(person), child_id: Number(id), context: "child", store_items_type: "disconnect" });
  };
  return { request, relations, access, get, owned, map, list, update, create, remove };
}