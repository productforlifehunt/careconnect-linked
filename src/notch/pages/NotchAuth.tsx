import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { nnRequestPasswordReset, nnConfirmPasswordReset } from "@/notch/lib/nn-auth";

type Mode = "login" | "signup" | "forgot" | "reset";

export default function NotchAuth() {
  const [sp] = useSearchParams();
  const [mode, setMode] = useState<Mode>(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login, register } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === "signup") { await register(email, password, displayName); nav(path("/")); }
      else if (mode === "login") { await login(email, password); nav(path("/")); }
      else if (mode === "forgot") { await nnRequestPasswordReset(email); setMsg("Reset code sent — check your email."); setMode("reset"); }
      else if (mode === "reset") { await nnConfirmPasswordReset(email, code, password); setMsg("Password reset. You can log in now."); setMode("login"); }
    } catch (ex: any) { setErr(ex?.message || "Failed"); } finally { setBusy(false); }
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "reset" ? "Set a new password" : "Log in to Notch Note";
  const cta = mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset code" : mode === "reset" ? "Update password" : "Log in";

  return (
    <div className="nn-auth-shell">
      <div className="nn-auth-card">
        <div style={{ textAlign: "center", fontSize: 32, marginBottom: 8 }}>📓</div>
        <div className="nn-auth-title">{title}</div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <input className="nn-auth-input" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          )}
          <input className="nn-auth-input" placeholder={mode === "login" ? "Email or username" : "Email"} type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === "reset" && (
            <input className="nn-auth-input" placeholder="Reset code from email" required value={code} onChange={(e) => setCode(e.target.value)} />
          )}
          {(mode === "login" || mode === "signup" || mode === "reset") && (
            <input className="nn-auth-input" placeholder={mode === "reset" ? "New password" : "Password"} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          {err && <div className="nn-auth-err">{err}</div>}
          {msg && <div style={{ color: "var(--nn-text-secondary)", fontSize: 13, marginBottom: 8 }}>{msg}</div>}
          <button className="nn-auth-btn" disabled={busy}>{busy ? "…" : cta}</button>
        </form>
        <div className="nn-auth-switch">
          {mode === "login" && (
            <>
              <button type="button" onClick={() => setMode("forgot")}>Forgot password?</button>
              <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>
              No account? <button type="button" onClick={() => setMode("signup")}>Sign up</button>
            </>
          )}
          {mode === "signup" && (<>Already have an account? <button type="button" onClick={() => setMode("login")}>Log in</button></>)}
          {(mode === "forgot" || mode === "reset") && (
            <><button type="button" onClick={() => setMode("login")}>Back to log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
