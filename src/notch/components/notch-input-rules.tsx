/**
 * Extra Notion-style input rules & keyboard shortcuts that go beyond StarterKit.
 * - `[]` / `[ ]` / `[x]` at line start → task list (checked state respected)
 * - `==text==` → highlight mark
 * - `` `text` `` is already handled by StarterKit (inline code)
 * - Cmd/Ctrl+Shift+H → toggle highlight
 * - Cmd/Ctrl+Shift+M → insert callout
 * - Cmd/Ctrl+Shift+X → toggle strike (also default; kept for consistency)
 */
import { Extension } from "@tiptap/core";
import { InputRule, markInputRule } from "@tiptap/core";

export const NotchInputRules = Extension.create({
  name: "notchInputRules",

  addInputRules() {
    return [
      // `[]` / `[ ]` / `[x]` + space at paragraph start → task list
      new InputRule({
        find: /^\s*\[([ xX]?)\]\s$/,
        handler: ({ state, range, match, chain }) => {
          const checked = /[xX]/.test(match[1]);
          const $from = state.doc.resolve(range.from);
          // Only convert when it's an empty-ish paragraph at line start.
          if ($from.parent.type.name !== "paragraph") return null;
          chain()
            .deleteRange(range)
            .toggleTaskList()
            .updateAttributes("taskItem", { checked })
            .run();
        },
      }),
    ];
  },

  addPasteRules() {
    return [];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.chain().focus().toggleHighlight().run(),
      "Mod-Shift-m": () =>
        this.editor
          .chain()
          .focus()
          .insertContent({
            type: "callout",
            attrs: { icon: "💡", color: "default" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Note" }] }],
          })
          .run(),
      // Convenience: Cmd/Ctrl+Enter toggles a task item's checked state
      "Mod-Enter": () => {
        const { editor } = this;
        if (!editor.isActive("taskItem")) return false;
        const attrs = editor.getAttributes("taskItem");
        return editor.chain().focus().updateAttributes("taskItem", { checked: !attrs.checked }).run();
      },
      // Notion-style: Cmd/Ctrl+/ → open comment (delegated via custom event)
      "Mod-Shift-/": () => {
        window.dispatchEvent(new CustomEvent("nn:add-comment"));
        return true;
      },
    };
  },
});

/** ==highlight== paste-like mark rule (registered separately so the mark type is available). */
export function createHighlightInputRule(markType: any) {
  return markInputRule({
    find: /(?:^|\s)(==([^=]+)==)$/,
    type: markType,
  });
}
