/**
 * Notch Note — Per-block sync engine.
 *
 * Instead of persisting the whole editor doc as one blob and racing on save,
 * this extension:
 *   1. Tags every top-level block with a stable `bid` attribute (uuid).
 *   2. On each transaction, diffs per-block content JSON against a snapshot
 *      and emits per-block ops `{ pageId, bid, content, lamport, actor }`.
 *   3. Broadcasts ops over `BroadcastChannel` for same-browser multi-tab
 *      live-sync.
 *   4. On receiving an op, locates the node with the matching `bid` and
 *      replaces its content — but only if the incoming lamport is greater
 *      than the last locally applied lamport for that block (LWW).
 *
 * This gives us Notion-like real-time block-level convergence across tabs
 * without pulling in a full CRDT (Yjs) runtime.
 */
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

type Op = { pageId: string; bid: string; content: any; lamport: number; actor: string };

const CH = "nn-block-sync";
const actorId = `a_${Math.random().toString(36).slice(2, 10)}`;
const genBid = () => `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// Per-page in-memory lamport clocks so peer ops don't clobber newer local edits.
const localClock = new Map<string, Map<string, number>>();
const bump = (pageId: string, bid: string): number => {
  let m = localClock.get(pageId);
  if (!m) { m = new Map(); localClock.set(pageId, m); }
  const next = (m.get(bid) || 0) + 1;
  m.set(bid, next);
  return next;
};
const seen = (pageId: string, bid: string, l: number): boolean => {
  const m = localClock.get(pageId);
  const cur = m?.get(bid) || 0;
  if (l <= cur) return true;
  if (!m) localClock.set(pageId, new Map([[bid, l]]));
  else m.set(bid, l);
  return false;
};

let channel: BroadcastChannel | null = null;
const getChannel = (): BroadcastChannel | null => {
  if (channel) return channel;
  if (typeof BroadcastChannel === "undefined") return null;
  try { channel = new BroadcastChannel(CH); } catch { channel = null; }
  return channel;
};

export interface BlockSyncOptions {
  pageId: string;
  /** Block nodes to which we attach `bid`. Defaults to StarterKit's common blocks. */
  types?: string[];
}

const BlockSyncKey = new PluginKey("nn-block-sync");

export const BlockSync = Extension.create<BlockSyncOptions>({
  name: "blockSync",
  addOptions() {
    return {
      pageId: "",
      types: [
        "paragraph", "heading", "bulletList", "orderedList", "taskList",
        "blockquote", "codeBlock", "horizontalRule", "callout", "mathBlock",
        "columns", "syncBlock", "audio", "video", "pdf", "toc", "breadcrumb",
        "tabsBlock", "htmlEmbed", "inlineDatabase", "whiteboard", "image",
      ],
    };
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types || [],
      attributes: {
        bid: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).getAttribute("data-bid") || null,
          renderHTML: (attrs) => (attrs.bid ? { "data-bid": attrs.bid } : {}),
        },
      },
    }];
  },
  addProseMirrorPlugins() {
    const opts = this.options;
    const editorRef = this.editor;
    return [new Plugin({
      key: BlockSyncKey,
      // Assign bids to any top-level block that lacks one.
      appendTransaction(_trs, _oldState, newState) {
        let tr = newState.tr;
        let modified = false;
        newState.doc.forEach((node, offset) => {
          if (!node.attrs || node.attrs.bid) return;
          if (!(opts.types || []).includes(node.type.name)) return;
          tr = tr.setNodeAttribute(offset, "bid", genBid());
          modified = true;
        });
        return modified ? tr : null;
      },
      view(_view) {
        const prevContent = new Map<string, string>();
        // Seed the snapshot from the initial doc.
        const seed = () => {
          const doc = editorRef.state.doc;
          doc.forEach((node) => {
            const bid = node.attrs?.bid;
            if (bid) prevContent.set(bid, JSON.stringify(node.toJSON()));
          });
        };
        seed();

        // Receive remote ops.
        const ch = getChannel();
        const onMsg = (e: MessageEvent) => {
          const op = e.data as Op;
          if (!op || op.actor === actorId) return;
          if (op.pageId !== opts.pageId) return;
          if (seen(op.pageId, op.bid, op.lamport)) return;
          // Locate the node with this bid and replace it.
          const { state } = editorRef;
          let target: { pos: number; nodeSize: number } | null = null;
          state.doc.forEach((n, pos) => { if (n.attrs?.bid === op.bid) target = { pos, nodeSize: n.nodeSize }; });
          try {
            if (target) {
              const t = target as { pos: number; nodeSize: number };
              const nn = state.schema.nodeFromJSON(op.content);
              editorRef.view.dispatch(state.tr.replaceWith(t.pos, t.pos + t.nodeSize, nn).setMeta("nn-remote", true));
            } else {
              // New block from a peer — append at end.
              const nn = state.schema.nodeFromJSON(op.content);
              editorRef.view.dispatch(state.tr.insert(state.doc.content.size, nn).setMeta("nn-remote", true));
            }
            prevContent.set(op.bid, JSON.stringify(op.content));
          } catch { /* schema mismatch — ignore */ }
        };
        ch?.addEventListener("message", onMsg);

        return {
          // Local edits: diff and broadcast changed blocks.
          update: (_view, prevState) => {
            const doc = editorRef.state.doc;
            if (doc === prevState.doc) return;
            const currentBids = new Set<string>();
            doc.forEach((node) => {
              const bid = node.attrs?.bid;
              if (!bid) return;
              currentBids.add(bid);
              const json = JSON.stringify(node.toJSON());
              if (prevContent.get(bid) === json) return;
              prevContent.set(bid, json);
              const lamport = bump(opts.pageId, bid);
              try {
                ch?.postMessage({ pageId: opts.pageId, bid, content: node.toJSON(), lamport, actor: actorId } as Op);
              } catch { /* payload too large — skip */ }
            });
            // Prune snapshots for blocks that were removed.
            for (const bid of prevContent.keys()) {
              if (!currentBids.has(bid)) prevContent.delete(bid);
            }
          },
          destroy: () => { ch?.removeEventListener("message", onMsg); },
        };
      },
    })];
  },
});
