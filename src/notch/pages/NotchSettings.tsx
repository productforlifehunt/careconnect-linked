import { useEffect, useState } from "react";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { Moon, Sun } from "lucide-react";
import { NotchMembersPanel } from "@/notch/components/NotchMembersPanel";
import { requestBrowserNotificationPermission } from "@/notch/lib/nn-notifications";

export default function NotchSettings() {
  const { user, logout } = useNotchAuth();
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("nn_theme") as any) || "light");

  useEffect(() => {
    localStorage.setItem("nn_theme", theme);
    window.dispatchEvent(new Event("nn:theme-changed"));
  }, [theme]);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Settings</div>

        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 1 }}>Account</div>
          <div style={{ margin: "8px 0" }}><strong>Email:</strong> {user?.user_email}</div>
          <div style={{ margin: "8px 0" }}><strong>Display name:</strong> {user?.user_display_name}</div>
          <div style={{ margin: "8px 0" }}><strong>User ID:</strong> {user?.user_id}</div>
        </div>

        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Appearance</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setTheme("light")}
              className={`nn-topbar-btn ${theme === "light" ? "active" : ""}`}
              style={{ padding: "6px 12px", border: theme === "light" ? "1px solid var(--nn-blue)" : "1px solid var(--nn-border)" }}
            ><Sun size={14} style={{ marginRight: 6 }} /> Light</button>
            <button
              onClick={() => setTheme("dark")}
              className={`nn-topbar-btn ${theme === "dark" ? "active" : ""}`}
              style={{ padding: "6px 12px", border: theme === "dark" ? "1px solid var(--nn-blue)" : "1px solid var(--nn-border)" }}
            ><Moon size={14} style={{ marginRight: 6 }} /> Dark</button>
          </div>
        </div>

        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Shortcuts</div>
          <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", lineHeight: 1.8 }}>
            <div><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> — Quick find</div>
            <div><kbd>/</kbd> — Slash commands in editor</div>
            <div><kbd>⌘</kbd> + <kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd> — Bold / Italic / Underline</div>
          </div>
        </div>

        <button className="nn-btn-primary" onClick={logout} style={{ background: "#e03e3e" }}>Log out</button>
      </div>
    </div>
  );
}
