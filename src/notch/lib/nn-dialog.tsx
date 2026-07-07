/**
 * Notion-style inline prompt/confirm/alert modals.
 * Replaces native window.prompt/confirm/alert with themed dialogs.
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type PromptOpts = {
  title?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  type?: "text" | "datetime-local";
  multiline?: boolean;
};

function Modal({
  kind,
  message,
  title,
  opts,
  resolve,
}: {
  kind: "prompt" | "confirm" | "alert";
  message: string;
  title?: string;
  opts?: PromptOpts;
  resolve: (v: any) => void;
}) {
  const [val, setVal] = useState(opts?.defaultValue ?? "");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolve(kind === "prompt" ? null : false);
      if (e.key === "Enter" && kind !== "prompt") { e.preventDefault(); resolve(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, resolve]);
  const submit = () => {
    if (kind === "prompt") resolve(val);
    else if (kind === "confirm") resolve(true);
    else resolve(undefined);
  };
  const cancel = () => resolve(kind === "prompt" ? null : false);
  return (
    <div
      onClick={cancel}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--nn-bg, #fff)", color: "var(--nn-text, #111)",
          borderRadius: 8, width: "100%", maxWidth: 440, padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {(title || opts?.title) && (
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{opts?.title || title}</div>
        )}
        {message && (
          <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 12, whiteSpace: "pre-wrap" }}>
            {message}
          </div>
        )}
        {kind === "prompt" && (
          opts?.multiline ? (
            <textarea
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={opts?.placeholder}
              rows={4}
              className="nn-auth-input"
              style={{ width: "100%", marginBottom: 12, resize: "vertical" }}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
            />
          ) : (
            <input
              autoFocus
              type={opts?.type || "text"}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={opts?.placeholder}
              className="nn-auth-input"
              style={{ width: "100%", marginBottom: 12 }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
            />
          )
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {kind !== "alert" && (
            <button onClick={cancel} className="nn-topbar-btn" style={{ padding: "6px 14px" }}>Cancel</button>
          )}
          <button onClick={submit} className="nn-btn-primary" style={{ padding: "6px 16px" }}>
            {opts?.submitLabel || (kind === "prompt" ? "OK" : kind === "confirm" ? "Confirm" : "OK")}
          </button>
        </div>
      </div>
    </div>
  );
}

function open<T>(node: (resolve: (v: T) => void) => JSX.Element): Promise<T> {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const done = (v: T) => {
      resolve(v);
      setTimeout(() => { root.unmount(); host.remove(); }, 0);
    };
    root.render(node(done));
  });
}

export function nnPrompt(message: string, opts: PromptOpts = {}): Promise<string | null> {
  return open<string | null>((resolve) => (
    <Modal kind="prompt" message={message} opts={opts} resolve={resolve} />
  ));
}

export function nnConfirm(message: string, title?: string): Promise<boolean> {
  return open<boolean>((resolve) => (
    <Modal kind="confirm" message={message} title={title} resolve={resolve} />
  ));
}

export function nnAlert(message: string, title?: string): Promise<void> {
  return open<void>((resolve) => (
    <Modal kind="alert" message={message} title={title} resolve={resolve} />
  ));
}
