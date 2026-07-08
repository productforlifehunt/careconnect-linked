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

  const subtitle = mode === "signup" ? "Free forever · No credit card" : mode === "forgot" ? "We'll email you a reset code." : mode === "reset" ? "Enter the code we sent and a new password." : "Welcome back. Sign in to continue.";

  return (
    <div className="nn-auth-shell">
      <div className="nn-auth-card">
        <div className="nn-auth-logo" aria-label="Notch Note">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="3" width="24" height="26" rx="3" fill="#f5f4ef" stroke="#37352f" strokeWidth="1.5"/>
            <rect x="7" y="7" width="14" height="2" rx="1" fill="#37352f"/>
            <rect x="7" y="12" width="18" height="2" rx="1" fill="#37352f"/>
            <rect x="7" y="17" width="12" height="2" rx="1" fill="#37352f"/>
            <rect x="7" y="22" width="16" height="2" rx="1" fill="#37352f"/>
          </svg>
        </div>
        <div className="nn-auth-title">{title}</div>
        <div className="nn-auth-subtitle">{subtitle}</div>

        {(mode === "login" || mode === "signup") && (
          <>
            <div className="nn-auth-sso">
              <button type="button" onClick={() => setErr("Google sign-in is coming soon. Use email for now.")}>
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
              <button type="button" onClick={() => setErr("Apple sign-in is coming soon. Use email for now.")}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M16.365 1.43c0 1.14-.42 2.22-1.11 3.02-.75.86-1.98 1.52-3 1.44-.11-1.12.4-2.28 1.06-3.02.75-.87 2.06-1.52 3.05-1.44zM20.03 17.6c-.55 1.28-.82 1.85-1.53 2.98-1 1.58-2.42 3.55-4.18 3.56-1.56.02-1.96-1.02-4.08-1-2.12.01-2.56 1.02-4.13 1-1.76-.02-3.09-1.79-4.09-3.37-2.81-4.42-3.1-9.61-1.37-12.36 1.23-1.94 3.16-3.08 4.98-3.08 1.86 0 3.02 1.02 4.56 1.02 1.49 0 2.4-1.02 4.55-1.02 1.62 0 3.35.88 4.58 2.41-4.02 2.2-3.36 7.94.71 9.86z"/></svg>
                Continue with Apple
              </button>
            </div>
            <div className="nn-auth-divider">or</div>
          </>
        )}

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
          {mode === "signup" && password && (
            <div style={{ marginTop: -4, marginBottom: 10 }}>
              {(() => {
                const s = (password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                const labels = ["Too weak", "Weak", "OK", "Good", "Strong"];
                const colors = ["#eb5757", "#eb5757", "#f5a623", "#448361", "#0f9d58"];
                return (
                  <div>
                    <div style={{ height: 3, background: "var(--nn-border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s * 25}%`, background: colors[s], transition: "width 0.15s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: colors[s], marginTop: 4 }}>{labels[s]} · Use 8+ chars, mix uppercase, numbers, symbols.</div>
                  </div>
                );
              })()}
            </div>
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
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--nn-text-tertiary)" }}>
          By continuing you agree to Notch Note's Terms and Privacy.
        </div>
      </div>
    </div>
  );
}
