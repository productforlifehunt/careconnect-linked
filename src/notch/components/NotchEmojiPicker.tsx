import { useMemo, useState, useRef } from "react";
import { Smile, Image as ImageIcon, Upload, Shuffle, Search } from "lucide-react";
import { nnUploadFile, pickFile } from "@/notch/lib/nn-files";

interface Props {
  onPick: (emoji: string) => void;
  onClear?: () => void;
}

type Tab = "emoji" | "icon" | "upload";

const CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: "Notes", emojis: ["📝","📓","📔","📒","📕","📗","📘","📙","📚","📖","📄","📃","📑","🗂","📂","📁","🗃","🗄","📌","📎","🖇","📊","📈","📉","📇","🗒","🗓","📅","🧾","✂️"] },
  { name: "Objects", emojis: ["💡","🔍","🔎","🔒","🔓","🔑","🗝","🔨","⛏","⚒","🛠","🗡","⚔","🔧","🪛","🔩","⚙️","🧰","🧲","🧪","🧫","🧬","🔬","🔭","📡","💻","🖥","🖨","⌨️","🖱"] },
  { name: "Symbols", emojis: ["✅","❌","⭐","🌟","✨","🔥","💯","⚡","💫","🌈","☀️","🌙","⏰","⏳","♻️","🔔","💭","💬","🗯","❤️","💔","💚","💙","💜","🖤","🤍","🤎","🧡","💛","🩶"] },
  { name: "Nature", emojis: ["🌱","🌿","🍀","🌷","🌸","🌹","🌺","🌻","🌼","🌵","🌴","🌳","🌲","🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑"] },
  { name: "Activities", emojis: ["🎯","🚀","🏆","🎨","🎭","🎬","🎤","🎧","🎼","🎹","🥁","🎸","🎺","🎻","🎮","🕹","🎰","🎲","🧩","♟","🎳","⚽","🏀","🏈","⚾","🎾","🏐","🏉","🥏","🎱"] },
  { name: "People", emojis: ["👤","👥","👶","👧","🧒","👦","👩","👨","🧑","👵","🧓","👴","👮","🕵","💂","👷","🤴","👸","🎓","🧠","💼","🏠","🧭","🗺","🌍","🌎","🌏"] },
  { name: "Weather", emojis: ["☀️","🌤","⛅","🌥","☁️","🌦","🌧","⛈","🌩","🌨","❄️","☃️","⛄","🌬","💨","🌪","🌫","🌊","💧","💦"] },
  { name: "Travel", emojis: ["✈️","🚀","🛸","🚁","🚂","🚆","🚇","🚊","🚄","🚅","🚈","🚉","🚌","🚗","🏎","🚙","🚕","🚓","🚑","🚒","🚚","🚛","🚜","🛵","🏍","🚲","🛴","🛹","🛼"] },
];

const ALL = CATEGORIES.flatMap((c) => c.emojis);

// Notion-style color tints; applied as CSS var so text/svg icons inherit.
const COLOR_SWATCHES: { name: string; value: string }[] = [
  { name: "Default", value: "" },
  { name: "Gray",    value: "#787774" },
  { name: "Brown",   value: "#976D57" },
  { name: "Orange",  value: "#CC782F" },
  { name: "Yellow",  value: "#C29343" },
  { name: "Green",   value: "#548164" },
  { name: "Blue",    value: "#487CA5" },
  { name: "Purple",  value: "#8A67AB" },
  { name: "Pink",    value: "#B35488" },
  { name: "Red",     value: "#C4554D" },
];

// Curated lucide-like unicode "icons" set (rendered as text glyphs) — feels
// like Notion's Icon tab without pulling a heavy SVG icon library.
const LINE_ICONS: string[] = [
  "★","☆","✦","✧","✪","✯","✵","❋","❤","☘","☀","☾","☁","☂","♞","♛","♜","♝","♟","♪",
  "♫","☎","✉","✂","✎","✐","✒","✔","✖","➤","➣","➢","➜","⇧","⇩","⇦","⇨","⤴","⤵","↺",
  "⏻","⌘","⌥","⇧","⏎","⏳","⌚","☕","♻","⚑","⚐","☕","♨","☯","☮","✂","✈","⚓","⚙","⚡",
];

export function EmojiPicker({ onPick, onClear }: Props) {
  const [tab, setTab] = useState<Tab>("emoji");
  const [q, setQ] = useState("");
  const [color, setColor] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return null;
    const ql = q.toLowerCase();
    const src = tab === "icon" ? LINE_ICONS : ALL;
    return src.filter((e) => {
      const cat = CATEGORIES.find((c) => c.emojis.includes(e))?.name.toLowerCase() || "";
      return cat.includes(ql);
    });
  }, [q, tab]);

  const wrap = (glyph: string) => (color ? `${glyph}\u200A` : glyph);

  const pickRandom = () => {
    const pool = tab === "icon" ? LINE_ICONS : ALL;
    onPick(wrap(pool[Math.floor(Math.random() * pool.length)]));
  };

  const doUpload = async () => {
    setBusy(true);
    try {
      const f = await pickFile("image/*");
      if (!f) return;
      const uid = (window as any).__NN_USER_ID__ || "anon";
      const { url } = await nnUploadFile(f, uid);
      onPick(url);
    } catch (e) { console.error(e); }
    setBusy(false);
  };

  const gridBtnStyle: React.CSSProperties = color
    ? { color, filter: "grayscale(0.2)" }
    : {};

  return (
    <div className="nn-emoji-picker" onClick={(e) => e.stopPropagation()} style={{ minWidth: 320 }}>
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--nn-border)", marginBottom: 6 }}>
        <TabBtn active={tab === "emoji"} onClick={() => setTab("emoji")}><Smile size={13} /> Emoji</TabBtn>
        <TabBtn active={tab === "icon"} onClick={() => setTab("icon")}><ImageIcon size={13} /> Icons</TabBtn>
        <TabBtn active={tab === "upload"} onClick={() => setTab("upload")}><Upload size={13} /> Upload</TabBtn>
        <div style={{ flex: 1 }} />
        <button onClick={pickRandom} title="Random" className="nn-topbar-btn" style={{ fontSize: 11 }}><Shuffle size={12} /></button>
      </div>

      {tab !== "upload" && (
        <>
          <div style={{ position: "relative", marginBottom: 6 }}>
            <Search size={12} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", color: "var(--nn-text-tertiary)" }} />
            <input
              className="nn-emoji-search"
              placeholder="Filter…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              style={{ paddingLeft: 22 }}
            />
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.value)}
                title={c.name}
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: c.value || "transparent",
                  border: c.value ? (color === c.value ? "2px solid var(--nn-text)" : "1px solid var(--nn-border)") : (color === "" ? "2px solid var(--nn-text)" : "1px dashed var(--nn-border-strong)"),
                  cursor: "pointer", padding: 0,
                }}
              />
            ))}
          </div>

          <div className="nn-emoji-grid" ref={gridRef} style={{ maxHeight: 240, overflowY: "auto" }}>
            {tab === "icon" ? (
              filtered
                ? filtered.map((e, i) => <button key={i + e} onClick={() => onPick(wrap(e))} style={gridBtnStyle}>{e}</button>)
                : LINE_ICONS.map((e, i) => <button key={"i" + i + e} onClick={() => onPick(wrap(e))} style={gridBtnStyle}>{e}</button>)
            ) : (
              filtered
                ? filtered.map((e, i) => <button key={i + e} onClick={() => onPick(wrap(e))} style={gridBtnStyle}>{e}</button>)
                : CATEGORIES.flatMap((c) => [
                    <div key={"h" + c.name} style={{ gridColumn: "span 9", fontSize: 11, color: "var(--nn-text-tertiary)", padding: "4px 2px", textTransform: "uppercase", fontWeight: 600 }}>{c.name}</div>,
                    ...c.emojis.map((e, i) => <button key={c.name + i + e} onClick={() => onPick(wrap(e))} style={gridBtnStyle}>{e}</button>),
                  ])
            )}
          </div>
        </>
      )}

      {tab === "upload" && (
        <div style={{ padding: 8 }}>
          <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 8 }}>Upload a custom image to use as the page icon.</div>
          <button onClick={doUpload} disabled={busy} className="nn-btn-primary" style={{ width: "100%" }}>
            <Upload size={13} style={{ marginRight: 6 }} /> {busy ? "Uploading…" : "Choose image"}
          </button>
          <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", marginTop: 8 }}>PNG, JPG, SVG. Recommended 128×128.</div>
        </div>
      )}

      {onClear && (
        <button
          onClick={onClear}
          style={{ width: "100%", marginTop: 6, background: "none", border: "1px solid var(--nn-border)", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "var(--nn-text-secondary)" }}
        >Remove icon</button>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="nn-topbar-btn"
      style={{
        fontSize: 12, borderRadius: 0,
        borderBottom: active ? "2px solid var(--nn-text)" : "2px solid transparent",
        display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px",
      }}
    >
      {children}
    </button>
  );
}
