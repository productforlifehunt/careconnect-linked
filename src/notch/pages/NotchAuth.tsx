import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchPath } from "@/notch/context/NotchBaseContext";

export default function NotchAuth() {
  const [sp] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login, register } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") await register(email, password, displayName);
      else await login(email, password);
      nav(path("/"));
    } catch (ex: any) {
      setErr(ex?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nn-auth-shell">
      <div className="nn-auth-card">
        <div style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>📓</div>
        <div className="nn-auth-title">{mode === "signup" ? "Create your account" : "Log in to Notch Note"}</div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <input className="nn-auth-input" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          )}
          <input className="nn-auth-input" placeholder="Email or username" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="nn-auth-input" placeholder="Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <div className="nn-auth-err">{err}</div>}
          <button className="nn-auth-btn" disabled={busy}>{busy ? "…" : mode === "signup" ? "Sign up" : "Log in"}</button>
        </form>
        <div className="nn-auth-switch">
          {mode === "signup" ? (
            <>Already have an account? <button type="button" onClick={() => setMode("login")}>Log in</button></>
          ) : (
            <>No account? <button type="button" onClick={() => setMode("signup")}>Sign up</button></>
          )}
        </div>
      </div>
    </div>
  );
}
