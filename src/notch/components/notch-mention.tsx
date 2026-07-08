/**
 * Notch Note — @mention with user autocomplete (Notion-style).
 * Backed by nn_workspace_member CCT — resolves member user_id + display name.
 */
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { cctList, NN } from "@/notch/lib/nn-client";

interface MemberOption { id: string; user_id: string; label: string; kind?: "person" | "date" | "page" }

let cachedMembers: MemberOption[] | null = null;
let cachedPages: MemberOption[] | null = null;
async function fetchMembers(workspaceId?: string): Promise<MemberOption[]> {
  if (cachedMembers) return cachedMembers;
  try {
    const rows = await cctList<any>(NN.member, workspaceId ? { workspace_id: workspaceId } : undefined);
    const list: MemberOption[] = rows.map((r: any) => ({
      id: String(r.id),
      user_id: String(r.user_id || ""),
      label: r.display_name || r.email || `User ${r.user_id}`,
      kind: "person" as const,
    }));
    cachedMembers = list;
    return list;
  } catch {
    return [];
  }
}
async function fetchPages(): Promise<MemberOption[]> {
  if (cachedPages) return cachedPages;
  try {
    const rows = await cctList<any>(NN.block, { per_page: 200 });
    const list: MemberOption[] = (rows || [])
      .filter((r: any) => (r.type === "page" || r.type === "database" || !r.type) && !r.in_trash)
      .map((r: any) => ({
        id: `page:${r.id}`,
        user_id: `page:${r.id}`,
        label: `${r.icon || (r.type === "database" ? "🗄️" : "📄")} ${r.title || "Untitled"}`,
        kind: "page" as const,
      }));
    cachedPages = list;
    return list;
  } catch {
    return [];
  }
}
export function invalidateMentionCache() { cachedMembers = null; cachedPages = null; }


interface Props {
  items: MemberOption[];
  command: (item: { id: string; label: string }) => void;
}

const MentionList = forwardRef<any, Props>((props, ref) => {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [props.items]);

  const pick = (i: number) => {
    const it = props.items[i];
    if (it) props.command({ id: it.user_id, label: it.label });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowDown") { setSelected((s) => (s + 1) % Math.max(1, props.items.length)); return true; }
      if (event.key === "ArrowUp") { setSelected((s) => (s - 1 + props.items.length) % Math.max(1, props.items.length)); return true; }
      if (event.key === "Enter") { pick(selected); return true; }
      return false;
    },
  }));

  if (!props.items.length) {
    return <div className="nn-mention-menu"><div className="nn-mention-empty">No people</div></div>;
  }
  return (
    <div className="nn-mention-menu">
      {props.items.map((it, i) => (
        <div
          key={it.id}
          className={`nn-mention-item ${i === selected ? "selected" : ""}`}
          onMouseEnter={() => setSelected(i)}
          onMouseDown={(e) => { e.preventDefault(); pick(i); }}
        >
          <span className="nn-mention-avatar">{it.label.charAt(0).toUpperCase()}</span>
          <span className="nn-mention-label">{it.label}</span>
        </div>
      ))}
    </div>
  );
});
MentionList.displayName = "MentionList";

export const NotchMention = Mention.configure({
  HTMLAttributes: { class: "nn-mention" },
  renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
  suggestion: {
    char: "@",
    items: async ({ query }: { query: string }) => {
      const [members, pages] = await Promise.all([fetchMembers(), fetchPages()]);
      const q = query.toLowerCase();
      const people = members.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 5);
      const pageMatches = pages.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 5);
      // Date suggestions — Notion-style. Match "today", "tomorrow", "yesterday", or ISO/MM-DD input.
      const dates: MemberOption[] = [];
      const mkDate = (offsetDays: number, label: string) => {
        const d = new Date(); d.setDate(d.getDate() + offsetDays);
        const iso = d.toISOString().slice(0, 10);
        return { id: `date:${iso}`, user_id: `date:${iso}`, label: `📅 ${label} (${iso})`, kind: "date" as const };
      };
      const dateKeywords = [
        { k: "today", d: 0 }, { k: "tomorrow", d: 1 }, { k: "yesterday", d: -1 },
        { k: "next week", d: 7 }, { k: "last week", d: -7 },
      ];
      for (const dk of dateKeywords) {
        if (!q || dk.k.includes(q)) dates.push(mkDate(dk.d, dk.k[0].toUpperCase() + dk.k.slice(1)));
      }
      if (q && /^\d/.test(q)) {
        const parsed = new Date(q);
        if (!isNaN(parsed.getTime())) {
          const iso = parsed.toISOString().slice(0, 10);
          dates.unshift({ id: `date:${iso}`, user_id: `date:${iso}`, label: `📅 ${iso}`, kind: "date" as const });
        }
      }
      return [...people, ...pageMatches, ...dates.slice(0, 4)];
    },

    render: () => {
      let component: ReactRenderer | null = null;
      let popup: HTMLDivElement | null = null;

      const position = (rect: DOMRect) => {
        if (!popup) return;
        popup.style.position = "fixed";
        popup.style.top = `${rect.bottom + 4}px`;
        popup.style.left = `${rect.left}px`;
        popup.style.zIndex = "1000";
      };

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, { props, editor: props.editor });
          popup = document.createElement("div");
          popup.appendChild(component.element);
          document.body.appendChild(popup);
          const rect = props.clientRect?.();
          if (rect) position(rect);
        },
        onUpdate: (props: any) => {
          component?.updateProps(props);
          const rect = props.clientRect?.();
          if (rect) position(rect);
        },
        onKeyDown: (props: any) => {
          if (props.event.key === "Escape") { popup?.remove(); popup = null; component?.destroy(); return true; }
          return (component?.ref as any)?.onKeyDown?.(props) ?? false;
        },
        onExit: () => {
          popup?.remove(); popup = null;
          component?.destroy(); component = null;
        },
      };
    },
  },
});
