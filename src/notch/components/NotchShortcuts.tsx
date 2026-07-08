import { X } from "lucide-react";

interface Props { onClose: () => void; }

const GROUPS: { label: string; items: [string, string][] }[] = [
  {
    label: "General",
    items: [
      ["⌘/Ctrl + K", "Quick Find"],
      ["⌘/Ctrl + J", "Ask AI"],
      ["⌘/Ctrl + P", "Open recently viewed page"],
      ["⌘/Ctrl + N", "Create new page"],
      ["⌘/Ctrl + /", "Show keyboard shortcuts"],
      ["⌘/Ctrl + \\", "Toggle sidebar"],
      ["Esc", "Close menu / clear selection"],
    ],
  },
  {
    label: "Editing",
    items: [
      ["/", "Open block insert menu"],
      ["@", "Mention person, page or date"],
      ["⌘/Ctrl + B", "Bold"],
      ["⌘/Ctrl + I", "Italic"],
      ["⌘/Ctrl + U", "Underline"],
      ["⌘/Ctrl + Shift + S", "Strikethrough"],
      ["⌘/Ctrl + E", "Inline code"],
      ["⌘/Ctrl + K (in selection)", "Add / edit link"],
      ["⌘/Ctrl + Shift + M", "Add comment"],
      ["⌘/Ctrl + A", "Select block, then all"],
      ["Ctrl + Space", "Continue with AI"],
      ["Tab / Shift + Tab", "Indent / outdent list"],
      ["⌘/Ctrl + Z / Shift + Z", "Undo / redo"],
    ],
  },
  {
    label: "Blocks",
    items: [
      ["#, ##, ### + Space", "Heading 1 / 2 / 3"],
      ["*, -, + + Space", "Bulleted list"],
      ["1. + Space", "Numbered list"],
      ["[] + Space", "To-do checkbox"],
      ["> + Space", "Toggle list"],
      ["\" + Space", "Quote block"],
      ["``` + Space", "Code block"],
      ["--- + Enter", "Divider"],
    ],
  },
  {
    label: "Databases",
    items: [
      ["⌘/Ctrl + click property", "Bulk-edit selected rows"],
      ["Shift + click row", "Range-select rows"],
      ["Drag column header", "Reorder columns"],
      ["Drag row handle", "Reorder rows"],
    ],
  },
];

export function NotchShortcuts({ onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--nn-bg)", border: "1px solid var(--nn-border)", borderRadius: 8, width: "min(720px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "var(--nn-shadow-lg)" }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--nn-border)" }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Keyboard shortcuts</div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {g.items.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                    <span style={{ color: "var(--nn-text-secondary)" }}>{v}</span>
                    <kbd style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, padding: "2px 6px", background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border)", borderRadius: 3, color: "var(--nn-text)" }}>{k}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
