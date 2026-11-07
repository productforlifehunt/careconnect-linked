import { createHash } from "node:crypto";
import { relative, resolve, sep } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

/** Embed a source fingerprint at build time; the browser never needs to fetch source files. */
export function inspectorSourcePlugin(): Plugin {
  const root = resolve(process.cwd(), "src") + sep;
  return {
    name: "inspector-source-fingerprints",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0] || "";
      if (
        !file.startsWith(root) ||
        !file.endsWith(".tsx") ||
        /\.test\.tsx$/.test(file) ||
        file.endsWith("/routes/__root.tsx")
      )
        return;
      const source = ts.createSourceFile(
        file,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const lines = code.split("\n");
      const name = relative(root, file).split(sep).join("/");
      const slots = new Map<string, number>();
      const edits: { pos: number; value: string; line: number; tag: string; identity: string }[] =
        [];
      const visit = (node: ts.Node) => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = node.tagName.getText(source);
          const formTag = /^(input|textarea|select|button|form|a|option)$/i.test(tag);
          const dynamicAttribute = node.attributes.properties.some((p) =>
            ts.isJsxAttribute(p) && p.initializer && ts.isJsxExpression(p.initializer),
          );
          const dynamicChild = ts.isJsxOpeningElement(node) && ts.isJsxElement(node.parent) &&
            node.parent.children.some((c) => ts.isJsxExpression(c) && !!c.expression);
          if (
            /^[A-Za-z][\w-]*$/.test(tag) &&
            (formTag || dynamicAttribute || dynamicChild) &&
            !node.attributes.properties.some(
              (p) =>
                ts.isJsxAttribute(p) &&
                p.name.getText(source) === "data-inspector-source",
            )
          ) {
            const position = source.getLineAndCharacterOfPosition(
              node.getStart(source),
            );
            const digest = createHash("sha256")
              .update(lines[position.line] || "")
              .digest("hex");
            const value = `${name}:${position.line + 1}:${position.character + 1}:${digest}`;
            let owner: ts.Node | undefined = node.parent;
            while (owner && !ts.isFunctionDeclaration(owner) && !ts.isVariableDeclaration(owner)) owner = owner.parent;
            const ownerName = owner && "name" in owner && owner.name ? (owner.name as ts.Node).getText(source) : "module";
            // Only structural control hints belong in the build identity. Runtime values,
            // checked state, labels and children are deliberately excluded: they change
            // during normal use and must not move an existing UI binding.
            const identifiers: string[] = [];
            const collect = (part: ts.Node) => {
              if (ts.isIdentifier(part)) identifiers.push(part.text);
              ts.forEachChild(part, collect);
            };
            for (const attr of node.attributes.properties) {
              if (
                ts.isJsxAttribute(attr) &&
                /^(name|id|type|on[A-Z].*)$/.test(attr.name.getText(source)) &&
                attr.initializer
              ) {
                if (
                  ts.isJsxExpression(attr.initializer) &&
                  attr.initializer.expression
                )
                  collect(attr.initializer.expression);
                else if (ts.isStringLiteral(attr.initializer))
                  identifiers.push(`${attr.name.getText(source)}=${attr.initializer.text}`);
              }
            }
            const semantic = identifiers.length ? `/${createHash("sha256").update(identifiers.join(".")).digest("hex").slice(0, 12)}` : "";
            const slot = `${name.replace(/\.tsx$/, "")}/${ownerName}/${tag}${semantic}`;
            const ordinal = slots.get(slot) || 0;
            slots.set(slot, ordinal + 1);
            edits.push({
              pos: node.tagName.end,
              value,
              line: position.line,
              tag,
              identity: `${slot}${semantic ? "" : `/${ordinal}`}`,
            });
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      if (!edits.length) return;
      const counts = new Map<string, number>();
      for (const edit of edits) {
        const key = `${edit.line}:${edit.tag}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      for (const edit of edits.reverse()) {
        const unique = counts.get(`${edit.line}:${edit.tag}`) === 1;
        code =
          code.slice(0, edit.pos) +
          (code.slice(edit.pos).split(/\/?>/, 1)[0]?.includes("data-inspector-id") ? "" : ` data-inspector-id=${JSON.stringify(edit.identity)}`) +
          ` data-inspector-source=${JSON.stringify(`${edit.value}:${unique ? "1" : "0"}`)}` +
          code.slice(edit.pos);
      }
      return { code, map: null };
    },
  };
}
