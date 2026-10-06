import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wpLogin, wpLogout, getStoredWPUser, wpRefreshToken, wpEnsureFreshToken } from "@/services/wp-auth";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { ESM_SPEC } from "@/features/esm/spec.generated";
import { ESM_CCT, ESM_REL } from "@/features/esm/backend";
import { wpAdminOps } from "@/services/woocommerce-api";
import InterviewsPanel from "./InterviewsPanel";

const RESEARCHER = "researcher";
type Kind = "screening" | "hourly" | "daily";
const CCT_NO: Record<Kind, string> = { screening: "318", hourly: "319", daily: "317" };

interface Participant {
  id: string;
  name: string;
  rows: Record<Kind, Record<string, any>[]>;
}

function isResearcher() {
  return getStoredWPUser()?.user_login === RESEARCHER;
}

/** Researcher dashboard: every participant's answers; only the researcher account can edit. */
export default function ResearcherApp() {
  const [signedIn, setSignedIn] = useState(isResearcher());

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("__site") !== "researcher") {
      url.searchParams.set("__site", "researcher");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // WordPress sign-ins expire after 60 minutes; keep renewing while this page is
  // open, and again whenever the tab/laptop wakes up (timers pause during sleep).
  useEffect(() => {
    if (!signedIn) return;
    const renew = () => { void wpEnsureFreshToken(); };
    void wpRefreshToken();
    const timer = window.setInterval(renew, 5 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") renew(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", renew);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", renew);
    };
  }, [signedIn]);

  const [showLogin, setShowLogin] = useState(false);
  const initialTab = new URL(window.location.href).searchParams.get("tab") === "interviews" || !signedIn ? "interviews" : "participants";

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-semibold text-foreground">{signedIn ? "Researcher dashboard" : "Interview records / 访谈记录"}</span>
          {signedIn ? (
            <Button variant="ghost" size="sm" onClick={() => { wpLogout(); setSignedIn(false); }}>Sign out</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowLogin((v) => !v)}>Researcher sign in / 研究者登录</Button>
          )}
        </div>
      </header>
      {showLogin && !signedIn ? (
        <Login onDone={() => { setSignedIn(true); setShowLogin(false); }} />
      ) : signedIn ? (
        <Tabs defaultValue={initialTab}>
          <div className="mx-auto max-w-5xl px-4 pt-4">
            <TabsList>
              <TabsTrigger value="participants">Participants / 参与者</TabsTrigger>
              <TabsTrigger value="interviews">Interviews / 访谈记录</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="participants"><Dashboard /></TabsContent>
          <TabsContent value="interviews"><InterviewsPanel canEdit /></TabsContent>
        </Tabs>
      ) : (
        <InterviewsPanel canEdit={false} />
      )}
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.trim().toLowerCase() !== RESEARCHER) {
      setError("Only the researcher account can sign in here.");
      return;
    }
    setBusy(true);
    try {
      await wpLogin(RESEARCHER, password);
      if (!isResearcher()) { wpLogout(); throw new Error("Only the researcher account can sign in here."); }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-3 px-4">
      <h1 className="text-xl font-semibold text-foreground">Researcher sign in</h1>
      <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

async function loadAll(): Promise<Participant[]> {
  const kinds: Kind[] = ["screening", "hourly", "daily"];
  const [rels, tables] = await Promise.all([
    Promise.all(kinds.map((k) => wordpressFetch<Record<string, { child_object_id: string }[]>>(`jet-rel/${ESM_REL[k]}`).catch(() => ({})))),
    Promise.all(kinds.map((k) => wordpressCCTFetch<Record<string, any>[]>(ESM_CCT[k]).catch(() => []))),
  ]);
  const byId = kinds.map((_, i) => new Map((tables[i] || []).map((r) => [String(r.id ?? r._ID), r])));
  const map = new Map<string, Participant>();
  kinds.forEach((k, i) => {
    Object.entries(rels[i] || {}).forEach(([userId, links]) => {
      const p = map.get(userId) ?? { id: userId, name: `User ${userId}`, rows: { screening: [], hourly: [], daily: [] } };
      ((links as { child_object_id: string }[]) || []).forEach((l) => { const row = byId[i].get(String(l.child_object_id)); if (row) p.rows[k].push(row); });
      map.set(userId, p);
    });
  });
  const ids = [...map.keys()];
  if (ids.length) {
    const users = await wpAdminOps<{ id: number; name: string; email?: string }[]>("get_user_names", { ids }).catch(() => null);
    (users || []).forEach((u) => { const p = map.get(String(u.id)); if (p) p.name = u.name || u.email || p.name; });
  }
  map.forEach((p) => kinds.forEach((k) => p.rows[k].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))));
  return [...map.values()].filter((p) => p.rows.screening.length + p.rows.hourly.length + p.rows.daily.length > 0).sort((a, b) => Number(a.id) - Number(b.id));
}

function Dashboard() {
  const [data, setData] = useState<Participant[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    loadAll().then((d) => { setData(d); setSelected(d[0]?.id ?? ""); }).catch((e) => setError(String(e?.message || e)));
  }, []);

  if (error) return <p className="p-6 text-destructive">{error}</p>;
  if (!data) return <p className="p-6 text-muted-foreground">Loading all participants…</p>;
  const current = data.find((p) => p.id === selected);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="mb-2 text-sm text-muted-foreground">{data.length} participants</p>
        {data.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${p.id === selected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-xs opacity-80">{p.rows.hourly.length} hourly · {p.rows.daily.length} daily · {p.rows.screening.length} screening</div>
          </button>
        ))}
      </aside>
      {current && (
        <Tabs defaultValue="hourly" key={current.id}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="screening">Screening ({current.rows.screening.length})</TabsTrigger>
            <TabsTrigger value="hourly">Hourly ({current.rows.hourly.length})</TabsTrigger>
            <TabsTrigger value="daily">Daily ({current.rows.daily.length})</TabsTrigger>
          </TabsList>
          {(["screening", "hourly", "daily"] as Kind[]).map((k) => (
            <TabsContent key={k} value={k} className="mt-4 space-y-3">
              {current.rows[k].length === 0 && <p className="text-muted-foreground">No answers yet.</p>}
              {current.rows[k].map((row) => <AnswerCard key={row.id} kind={k} row={row} start={studyStart(current)} canEdit={isResearcher()} />)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

const HAN = /[\u4e00-\u9fff]/;
const TR_CACHE_KEY = "researcher-auto-translation-v1";
function readTrCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(TR_CACHE_KEY) || "{}"); } catch { return {}; }
}
// Cards ask at the same time; gather them into one request per screen.
let pending: { texts: Set<string>; waiters: ((c: Record<string, string>) => void)[]; fail: ((e: unknown) => void)[] } | null = null;
function autoTranslate(texts: string[]): Promise<Record<string, string>> {
  const cache = readTrCache();
  const missing = texts.filter((t) => !cache[t]);
  if (!missing.length) return Promise.resolve(cache);
  return new Promise((resolve, reject) => {
    if (!pending) {
      pending = { texts: new Set(), waiters: [], fail: [] };
      window.setTimeout(async () => {
        const batch = pending!; pending = null;
        try {
          const list = [...batch.texts];
          const c = readTrCache();
          for (let i = 0; i < list.length; i += 20) {
            const chunk = list.slice(i, i + 20);
            const { data, error } = await supabase.functions.invoke("ai?task=chat-translate", { body: { texts: chunk } });
            if (error) throw error;
            const out: string[] = data?.translations || [];
            chunk.forEach((t, j) => { if (out[j]) c[t] = out[j]; });
          }
          try { localStorage.setItem(TR_CACHE_KEY, JSON.stringify(c)); } catch { /* full */ }
          batch.waiters.forEach((w) => w(c));
        } catch (e) { batch.fail.forEach((f) => f(e)); }
      }, 100);
    }
    missing.forEach((t) => pending!.texts.add(t));
    pending.waiters.push(resolve); pending.fail.push(reject);
  });
}

/** Splits a stored timestamp (ISO text or unix seconds/ms) into a local day number and clock time. */
function parseStamp(value: unknown): { day: number | null; hour: number | null; minute: string } {
  const text = String(value ?? "").trim();
  if (/^\d{9,13}$/.test(text) || /Z$|[+-]\d{2}:\d{2}$/.test(text)) {
    const d = /^\d+$/.test(text) ? new Date(text.length > 10 ? Number(text) : Number(text) * 1000) : new Date(text);
    return { day: Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000), hour: d.getHours(), minute: String(d.getMinutes()).padStart(2, "0") };
  }
  const m = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  const t = text.match(/(?:T|\s|^)(\d{1,2}):(\d{2})/);
  return { day: m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000) : null, hour: t ? Number(t[1]) : null, minute: t ? t[2] : "" };
}
/** When a row's answers happened: its first dated answer, else when it was saved. */
function rowStamp(kind: Kind, row: Record<string, any>): unknown {
  const dated = ESM_SPEC.find((i) => i.cct === CCT_NO[kind] && (i.type === "datetime" || i.type === "date") && parseStamp(row[i.column]).day !== null);
  return dated ? row[dated.column] : row.created_at;
}
function studyStart(p: Participant): number | null {
  const days = [...p.rows.hourly.map((r) => rowStamp("hourly", r)), ...p.rows.daily.map((r) => rowStamp("daily", r))].map((v) => parseStamp(v).day).filter((d): d is number => d !== null);
  return days.length ? Math.min(...days) : null;
}
function studyTime(value: unknown, start: number | null): string {
  const { day, hour, minute } = parseStamp(value);
  const parts: string[] = [];
  if (day !== null && start !== null) parts.push(`Study day ${day - start + 1} / 研究第 ${day - start + 1} 天`);
  if (hour !== null) parts.push(`${hour < 12 ? "上午" : "下午"} ${hour % 12 || 12}:${minute}`);
  return parts.length || day !== null ? parts.join(" · ") : String(value ?? "");
}

function AnswerCard({ kind, row: initialRow, start, canEdit }: { kind: Kind; row: Record<string, any>; start: number | null; canEdit: boolean }) {
  const items = useMemo(() => ESM_SPEC.filter((i) => i.cct === CCT_NO[kind]), [kind]);
  const [row, setRow] = useState(initialRow);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [trError, setTrError] = useState(false);

  const freeTexts = useMemo(
    () => items.filter((i) => !i.options && (i.type === "text" || i.type === "longtext")).map((i) => String(row[i.column] ?? "")).filter((t) => HAN.test(t)),
    [items, row],
  );
  useEffect(() => {
    if (!freeTexts.length) return;
    let alive = true;
    autoTranslate(freeTexts).then((c) => alive && setTranslations(c)).catch(() => alive && setTrError(true));
    return () => { alive = false; };
  }, [freeTexts]);

  const save = async () => {
    const changed: Record<string, any> = {};
    Object.entries(draft).forEach(([k, v]) => { if (String(v ?? "") !== String(row[k] ?? "")) changed[k] = v; });
    if (!Object.keys(changed).length) { setEditing(false); return; }
    setSaving(true); setSaveError("");
    try {
      await wpEnsureFreshToken();
      await wordpressCCTFetch(ESM_CCT[kind], { id: row.id, method: "POST", body: changed });
      const fresh = await wordpressCCTFetch<Record<string, any>>(ESM_CCT[kind], { id: row.id });
      setRow(fresh && typeof fresh === "object" && "id" in fresh ? fresh : { ...row, ...changed });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{studyTime(rowStamp(kind, row), start)}</CardTitle>
        {canEdit && !editing && (
          <Button size="sm" variant="outline" onClick={() => { setDraft({ ...row }); setEditing(true); }}>Edit / 编辑</Button>
        )}
        {canEdit && editing && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={saving} onClick={() => { setEditing(false); setSaveError(""); }}>Cancel / 取消</Button>
            <Button size="sm" disabled={saving} onClick={save}>{saving ? "Saving… / 保存中…" : "Save / 保存"}</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {saveError && <p className="mb-2 text-sm text-destructive">{saveError}</p>}
        <dl className="space-y-2 text-sm">
          {items.map((item) => {
            if (editing) {
              const v = draft[item.column] ?? "";
              const set = (val: any) => setDraft((d) => ({ ...d, [item.column]: val }));
              let field: React.ReactNode;
              if (item.options && item.type === "multi") {
                const chosen = String(v).split(",").map((c) => c.trim()).filter(Boolean);
                field = (
                  <div className="flex flex-wrap gap-3">
                    {item.options.map((o) => (
                      <label key={o.value} className="flex items-center gap-1">
                        <input type="checkbox" checked={chosen.includes(o.value)} onChange={(e) => set((e.target.checked ? [...chosen, o.value] : chosen.filter((c) => c !== o.value)).join(","))} />
                        {o.label}
                      </label>
                    ))}
                  </div>
                );
              } else if (item.options) {
                field = (
                  <select className="w-full rounded-md border border-input bg-background px-2 py-1" value={String(v)} onChange={(e) => set(e.target.value)}>
                    <option value="">—</option>
                    {item.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                );
              } else if (item.type === "longtext" || item.type === "text") {
                field = <Textarea value={String(v)} onChange={(e) => set(e.target.value)} rows={item.type === "longtext" ? 4 : 2} />;
              } else {
                field = <Input value={String(v)} onChange={(e) => set(e.target.value)} />;
              }
              return (
                <div key={item.id}>
                  <dt className="mb-1 text-muted-foreground">{item.label}</dt>
                  <dd>{field}</dd>
                </div>
              );
            }
            const v = row[item.column];
            if (v === undefined || v === null || v === "") return null;
            // JetEngine stores a cleared number as 0; hide it where 0 is not a valid answer.
            const zeroIsBlank = item.type === "number" || (item.scale ? item.scale.min > 0 : false);
            if (zeroIsBlank && String(v) === "0") return null;
            // NPI-Q severity/distress are only asked when the symptom is marked present.
            if (/ (severity|caregiver distress)$/.test(item.label)) {
              const symptom = item.label.replace(/ (severity|caregiver distress)$/, "");
              const present = items.find((p) => p.label.startsWith(`${symptom} present:`));
              if (present && row[present.column] !== "b01") return null;
            }
            const shown = item.options
              ? String(v).split(",").map((c) => item.options!.find((o) => o.value === c.trim())?.label ?? c).join(", ")
              : item.type === "datetime" || item.type === "date"
                ? studyTime(v, start)
                : String(v);
            const isFree = !item.options && (item.type === "text" || item.type === "longtext") && HAN.test(String(v));
            const tr = isFree ? translations[String(v)] : undefined;
            return (
              <div key={item.id}>
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="text-foreground whitespace-pre-wrap">{shown}</dd>
                {isFree && (
                  <dd className="mt-1 rounded-md bg-muted px-3 py-2">
                    <span className="block text-xs text-muted-foreground">Auto translation (ChatGPT-5-nano, long reasoning) / 自动翻译</span>
                    <span className="whitespace-pre-wrap text-foreground">{tr ?? (trError ? "Translation unavailable right now." : "Translating…")}</span>
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
