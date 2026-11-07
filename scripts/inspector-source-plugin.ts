import { createHash } from 'node:crypto';
import { relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import type { Plugin } from 'vite';

/** Embed a source fingerprint at build time; the browser never needs to fetch source files. */
export function inspectorSourcePlugin(): Plugin {
  const root = resolve(process.cwd(), 'src') + sep;
  return {
    name: 'inspector-source-fingerprints',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0] || '';
      if (!file.startsWith(root) || !file.endsWith('.tsx') || /\.test\.tsx$/.test(file)) return;
      const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const lines = code.split('\n');
      const name = relative(root, file).split(sep).join('/');
      const edits: { pos: number; value: string }[] = [];
      const visit = (node: ts.Node) => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = node.tagName.getText(source);
          if (/^[a-z][\w-]*$/.test(tag) && !node.attributes.properties.some(p => ts.isJsxAttribute(p) && p.name.getText(source) === 'data-inspector-source')) {
            const position = source.getLineAndCharacterOfPosition(node.getStart(source));
            const digest = createHash('sha256').update(lines[position.line] || '').digest('hex');
            const value = `${name}:${position.line + 1}:${position.character + 1}:${digest}`;
            edits.push({ pos: node.tagName.end, value: ` data-inspector-source=${JSON.stringify(value)}` });
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      if (!edits.length) return;
      for (const edit of edits.reverse()) code = code.slice(0, edit.pos) + edit.value + code.slice(edit.pos);
      return { code, map: null };
    },
  };
}
