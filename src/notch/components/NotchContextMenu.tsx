import { useEffect, useRef } from "react";
import { Copy, Link2, Pencil, Star, Trash2, Plus, StarOff, Users } from "lucide-react";

export interface NotchContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

export function NotchContextMenu({
  x, y, items, onClose,
}: { x: number; y: number; items: NotchContextMenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  // clamp to viewport
  const vw = window.innerWidth, vh = window.innerHeight;
  const W = 220, H = items.length * 32 + 8;
  const left = Math.min(x, vw - W - 8);
  const top = Math.min(y, vh - H - 8);

  return (
    <div
      ref={ref}
      className="nn-context-menu"
      style={{ position: "fixed", left, top, width: W, zIndex: 1000 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) => (
        <div key={i}>
          {it.divider && <div className="nn-context-divider" />}
          <button
            className={`nn-context-item ${it.danger ? "danger" : ""}`}
            onClick={() => { it.onClick(); onClose(); }}
          >
            <span className="nn-context-icon">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export const CtxIcons = { Copy, Link2, Pencil, Star, StarOff, Trash2, Plus };
