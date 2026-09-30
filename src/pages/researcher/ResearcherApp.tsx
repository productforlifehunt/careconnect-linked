import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wpLogin, wpLogout, getStoredWPUser } from "@/services/wp-auth";
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

/** Researcher dashboard: every participant's answers, read-only. */
export default function ResearcherApp() {
  const [signedIn, setSignedIn] = useState(isResearcher());

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("__site") !== "researcher") {
      url.searchParams.set("__site", "researcher");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

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
  const byId = kinds.map((_, i) => new Map((tables[i] || []).map((r) => [String(r._ID ?? r.id), r])));
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
  map.forEach((p) => kinds.forEach((k) => p.rows[k].sort((a, b) => String(a.cct_created).localeCompare(String(b.cct_created)))));
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
              {current.rows[k].map((row) => <AnswerCard key={row._ID} kind={k} row={row} />)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function AnswerCard({ kind, row }: { kind: Kind; row: Record<string, any> }) {
  const items = useMemo(() => ESM_SPEC.filter((i) => i.cct === CCT_NO[kind]), [kind]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Saved {row.cct_created}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          {items.map((item) => {
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
              : String(v);
            return (
              <div key={item.id}>
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="text-foreground whitespace-pre-wrap">{shown}</dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
