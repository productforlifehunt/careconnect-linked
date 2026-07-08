import { useEffect, useState } from "react";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { Moon, Sun, User, SlidersHorizontal, Bell, Users, Keyboard, LogOut, Download } from "lucide-react";
import { NotchMembersPanel } from "@/notch/components/NotchMembersPanel";
import { requestBrowserNotificationPermission } from "@/notch/lib/nn-notifications";
import { nnAlert } from "@/notch/lib/nn-dialog";
import { importMarkdownFiles, importCsvAsDatabase } from "@/notch/lib/nn-importers";
import { cctList, NN } from "@/notch/lib/nn-client";

type TabKey = "account" | "preferences" | "notifications" | "members" | "shortcuts" | "import";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "account", label: "My account", icon: User },
  { key: "preferences", label: "My settings", icon: SlidersHorizontal },
  { key: "notifications", label: "My notifications", icon: Bell },
  { key: "members", label: "People", icon: Users },
  { key: "import", label: "Import", icon: Download },
  { key: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

export default function NotchSettings() {
  const { user, logout } = useNotchAuth();
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("nn_theme") as any) || "light");
  const [tab, setTab] = useState<TabKey>(() => (localStorage.getItem("nn_settings_tab") as TabKey) || "account");
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;

  useEffect(() => {
    localStorage.setItem("nn_theme", theme);
    window.dispatchEvent(new Event("nn:theme-changed"));
  }, [theme]);

  useEffect(() => { localStorage.setItem("nn_settings_tab", tab); }, [tab]);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page" style={{ maxWidth: 960 }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Settings</div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>
          {/* Left rail */}
          <nav
            style={{
              width: isMobile ? "100%" : 200,
              flexShrink: 0,
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              gap: 2,
              overflowX: isMobile ? "auto" : undefined,
              borderBottom: isMobile ? "1px solid var(--nn-border)" : undefined,
              paddingBottom: isMobile ? 6 : 0,
            }}
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 6,
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: active ? "var(--nn-bg-secondary)" : "transparent",
                    color: "var(--nn-text)", fontSize: 14, fontWeight: active ? 500 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={15} /> {label}
                </button>
              );
            })}
          </nav>

          {/* Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === "account" && (
              <section>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>My account</div>
                <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 16 }}>
                  <Row label="Email" value={user?.user_email} />
                  <Row label="Display name" value={user?.user_display_name} />
                  <Row label="User ID" value={String(user?.user_id ?? "")} />
                </div>
                <button className="nn-btn-primary" onClick={logout} style={{ background: "var(--nn-danger)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <LogOut size={14} /> Log out
                </button>
              </section>
            )}

            {tab === "preferences" && (
              <section>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>My settings</div>
                <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Appearance</div>
                  <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 10 }}>Customize how Notch looks on this device.</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setTheme("light")}
                      className="nn-topbar-btn"
                      style={{ padding: "6px 12px", border: theme === "light" ? "1px solid var(--nn-blue)" : "1px solid var(--nn-border)" }}
                    ><Sun size={14} style={{ marginRight: 6 }} /> Light</button>
                    <button
                      onClick={() => setTheme("dark")}
                      className="nn-topbar-btn"
                      style={{ padding: "6px 12px", border: theme === "dark" ? "1px solid var(--nn-blue)" : "1px solid var(--nn-border)" }}
                    ><Moon size={14} style={{ marginRight: 6 }} /> Dark</button>
                  </div>
                </div>
              </section>
            )}

            {tab === "notifications" && (
              <section>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>My notifications</div>
                <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16 }}>
                  <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 10 }}>
                    Enable browser push notifications so reminders and mentions reach you even when Notch is in the background.
                  </div>
                  <button
                    className="nn-topbar-btn"
                    onClick={async () => {
                      const r = await requestBrowserNotificationPermission();
                      nnAlert(`Browser permission: ${r}`, "Notifications");
                    }}
                  >Enable browser notifications</button>
                </div>
              </section>
            )}

            {tab === "members" && (
              <section>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>People</div>
                <NotchMembersPanel />
              </section>
            )}

            {tab === "import" && <ImportPanel />}



            {tab === "shortcuts" && (
              <section>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Keyboard shortcuts</div>
                <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, fontSize: 13, lineHeight: 1.9 }}>
                  <Shortcut keys={["⌘/Ctrl", "K"]} label="Quick find" />
                  <Shortcut keys={["⌘/Ctrl", "J"]} label="Ask AI" />
                  <Shortcut keys={["⌘/Ctrl", "P"]} label="Command palette" />
                  <Shortcut keys={["/"]} label="Slash commands in editor" />
                  <Shortcut keys={["⌘", "B"]} label="Bold" />
                  <Shortcut keys={["⌘", "I"]} label="Italic" />
                  <Shortcut keys={["⌘", "U"]} label="Underline" />
                  <Shortcut keys={["⌘", "Shift", "S"]} label="Strikethrough" />
                  <Shortcut keys={["⌘", "K"]} label="Insert link" />
                  <Shortcut keys={["⌘", "Enter"]} label="Toggle checkbox / open link" />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--nn-border)", fontSize: 14 }}>
      <span style={{ color: "var(--nn-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--nn-text)" }}>{value || "—"}</span>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ color: "var(--nn-text-secondary)" }}>{label}</span>
      <span style={{ display: "flex", gap: 4 }}>
        {keys.map((k, i) => (
          <kbd key={i} style={{ padding: "2px 6px", background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border)", borderRadius: 4, fontSize: 11, fontFamily: "inherit" }}>{k}</kbd>
        ))}
      </span>
    </div>
  );
}

function ImportPanel() {
  const { user } = useNotchAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [ws, setWs] = useState<string>("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const w = await cctList<any>(NN.workspace);
        setWorkspaces(w || []);
        if (w?.[0]?.id) setWs(String(w[0].id));
      } catch { /* noop */ }
    })();
  }, []);
  const uid = user?.user_id || 0;
  const pickAndRun = async (accept: string, run: (fs: FileList) => Promise<string>) => {
    const input = document.createElement("input");
    input.type = "file"; input.multiple = true; input.accept = accept;
    input.onchange = async () => {
      if (!input.files || !input.files.length) return;
      if (!ws) { nnAlert("No workspace found.", "Import"); return; }
      setBusy(true);
      try { const msg = await run(input.files); nnAlert(msg, "Import complete"); }
      catch (e: any) { nnAlert(`Import failed: ${e?.message || e}`, "Import error"); }
      finally { setBusy(false); }
    };
    input.click();
  };
  return (
    <section>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Import</div>
      <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--nn-text-secondary)", display: "block", marginBottom: 4 }}>Workspace</label>
          <select value={ws} onChange={(e) => setWs(e.target.value)} style={{ padding: "6px 8px", border: "1px solid var(--nn-border)", borderRadius: 4, background: "var(--nn-bg)", color: "var(--nn-text)", fontSize: 13 }}>
            {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name || `Workspace ${w.id}`}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Markdown files (.md)</div>
          <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 6 }}>Each file becomes a new page. Headings, lists, code blocks, checkboxes, and blockquotes are preserved.</div>
          <button
            className="nn-btn-primary" disabled={busy || !ws}
            onClick={() => pickAndRun(".md,.markdown,.txt", async (fs) => {
              const r = await importMarkdownFiles(fs, { workspaceId: ws, userId: uid });
              return `Imported ${r.created} page${r.created === 1 ? "" : "s"}.`;
            })}
          >Choose Markdown files…</button>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>CSV file (.csv)</div>
          <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 6 }}>The first row becomes column names. A new database with one table view is created.</div>
          <button
            className="nn-btn-primary" disabled={busy || !ws}
            onClick={() => pickAndRun(".csv,text/csv", async (fs) => {
              const r = await importCsvAsDatabase(fs[0], { workspaceId: ws, userId: uid });
              return `Imported ${r.rows} row${r.rows === 1 ? "" : "s"} into a new database.`;
            })}
          >Choose CSV file…</button>
        </div>

        <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)" }}>
          Notion export ZIPs and HTML are not yet supported — extract the .md files first, then upload here.
        </div>
      </div>
    </section>
  );
}
