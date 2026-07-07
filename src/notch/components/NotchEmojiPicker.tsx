import { useMemo, useState } from "react";

interface Props {
  onPick: (emoji: string) => void;
  onClear?: () => void;
}

const CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: "Notes", emojis: ["📝","📓","📔","📒","📕","📗","📘","📙","📚","📖","📄","📃","📑","🗂","📂","📁","🗃","🗄","📌","📎","🖇","📊","📈","📉","📇","🗒","🗓","📅","🧾","✂️"] },
  { name: "Objects", emojis: ["💡","🔍","🔎","🔒","🔓","🔑","🗝","🔨","⛏","⚒","🛠","🗡","⚔","🔧","🪛","🔩","⚙️","🧰","🧲","🧪","🧫","🧬","🔬","🔭","📡","💻","🖥","🖨","⌨️","🖱"] },
  { name: "Symbols", emojis: ["✅","❌","⭐","🌟","✨","🔥","💯","⚡","💫","🌈","☀️","🌙","⏰","⏳","♻️","🔔","💭","💬","🗯","💯","❤️","💔","💚","💙","💜","🖤","🤍","🤎","🧡","💛"] },
  { name: "Nature", emojis: ["🌱","🌿","🍀","🌷","🌸","🌹","🌺","🌻","🌼","🌵","🌴","🌳","🌲","🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑"] },
  { name: "Activities", emojis: ["🎯","🚀","🏆","🎨","🎭","🎬","🎤","🎧","🎼","🎹","🥁","🎸","🎺","🎻","🎮","🕹","🎰","🎲","🧩","♟","🎳","⚽","🏀","🏈","⚾","🎾","🏐","🏉","🥏","🎱"] },
  { name: "People", emojis: ["👤","👥","👶","👧","🧒","👦","👩","👨","🧑","👵","🧓","👴","👮","🕵","💂","👷","🤴","👸","🎓","🧠","💼","🏠","🧭","🗺","🌍","🌎","🌏"] },
];

const ALL = CATEGORIES.flatMap((c) => c.emojis);

export function EmojiPicker({ onPick, onClear }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return null;
    const ql = q.toLowerCase();
    return ALL.filter((e) => {
      const cat = CATEGORIES.find((c) => c.emojis.includes(e))?.name.toLowerCase() || "";
      return cat.includes(ql);
    });
  }, [q]);

  return (
    <div className="nn-emoji-picker" onClick={(e) => e.stopPropagation()}>
      <input
        className="nn-emoji-search"
        placeholder="Filter…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className="nn-emoji-grid">
        {(filtered
          ? filtered.map((e, i) => <button key={i + e} onClick={() => onPick(e)}>{e}</button>)
          : CATEGORIES.flatMap((c) => [
              <div key={"h" + c.name} style={{ gridColumn: "span 9", fontSize: 11, color: "var(--nn-text-tertiary)", padding: "4px 2px", textTransform: "uppercase", fontWeight: 600 }}>{c.name}</div>,
              ...c.emojis.map((e, i) => <button key={c.name + i + e} onClick={() => onPick(e)}>{e}</button>),
            ])
        )}
      </div>
      {onClear && (
        <button
          onClick={onClear}
          style={{ width: "100%", marginTop: 6, background: "none", border: "1px solid var(--nn-border)", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "var(--nn-text-secondary)" }}
        >Remove icon</button>
      )}
    </div>
  );
}
