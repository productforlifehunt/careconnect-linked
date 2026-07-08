/**
 * Notch Note — Markdown / CSV / Notion ZIP importers.
 */
import JSZip from "jszip";
import { cctCreate, NN } from "@/notch/lib/nn-client";


function mdToTiptap(md: string): any {
  const lines = md.split(/\r?\n/);
  const content: any[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let codeLang = "";
  const pushCode = () => {
    content.push({ type: "codeBlock", attrs: { language: codeLang || null }, content: codeBuf.length ? [{ type: "text", text: codeBuf.join("\n") }] : [] });
    codeBuf = []; codeLang = "";
  };
  for (const raw of lines) {
    if (raw.trimStart().startsWith("```")) {
      if (inCode) { pushCode(); inCode = false; }
      else { inCode = true; codeLang = raw.trim().replace(/^```/, ""); }
      continue;
    }
    if (inCode) { codeBuf.push(raw); continue; }
    if (!raw.trim()) { continue; }
    const h = raw.match(/^(#{1,3})\s+(.*)$/);
    if (h) { content.push({ type: "heading", attrs: { level: h[1].length }, content: [{ type: "text", text: h[2] }] }); continue; }
    if (/^[-*]\s+\[[ xX]\]\s+/.test(raw)) {
      const checked = /\[[xX]\]/.test(raw);
      const text = raw.replace(/^[-*]\s+\[[ xX]\]\s+/, "");
      content.push({ type: "taskList", content: [{ type: "taskItem", attrs: { checked }, content: [{ type: "paragraph", content: [{ type: "text", text }] }] }] });
      continue;
    }
    if (/^[-*]\s+/.test(raw)) {
      const text = raw.replace(/^[-*]\s+/, "");
      content.push({ type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text }] }] }] });
      continue;
    }
    if (/^\d+\.\s+/.test(raw)) {
      const text = raw.replace(/^\d+\.\s+/, "");
      content.push({ type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text }] }] }] });
      continue;
    }
    if (/^>\s?/.test(raw)) {
      content.push({ type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: raw.replace(/^>\s?/, "") }] }] });
      continue;
    }
    content.push({ type: "paragraph", content: [{ type: "text", text: raw }] });
  }
  if (inCode) pushCode();
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export async function importMarkdownFiles(files: FileList | File[], opts: { workspaceId: string; parentId?: string; userId: number | string; }): Promise<{ created: number; ids: string[] }> {
  const arr = Array.from(files);
  const ids: string[] = [];
  for (const f of arr) {
    const txt = await f.text();
    const firstLine = txt.split(/\r?\n/).find((l) => l.trim());
    const title = (firstLine && /^#{1,3}\s+/.test(firstLine))
      ? firstLine.replace(/^#{1,3}\s+/, "").trim()
      : (f.name.replace(/\.[^.]+$/, "") || "Imported");
    const body = mdToTiptap(txt);
    const { id } = await cctCreate(NN.block, {
      workspace_id: opts.workspaceId,
      parent_id: opts.parentId || "",
      type: "page",
      title,
      icon: "📥",
      cover: "",
      properties: JSON.stringify({ body }),
      content_order: JSON.stringify([]),
      archived: 0,
      in_trash: 0,
      created_by: opts.userId,
      last_edited_by: opts.userId,
    });
    ids.push(id);
  }
  return { created: ids.length, ids };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = ""; let row: string[] = []; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.length));
}

export async function importCsvAsDatabase(file: File, opts: { workspaceId: string; parentId?: string; userId: number | string; }): Promise<{ databaseId: string; rows: number }> {
  const text = await file.text();
  const rows = parseCsv(text);
  if (!rows.length) return { databaseId: "", rows: 0 };
  const headers = rows[0];
  const dataRows = rows.slice(1);
  const properties = headers.map((h, i) => ({ id: `p_${i}`, name: h || `Col ${i + 1}`, type: i === 0 ? "title" : "text" }));
  const { id: dbId } = await cctCreate(NN.block, {
    workspace_id: opts.workspaceId,
    parent_id: opts.parentId || "",
    type: "database",
    title: file.name.replace(/\.[^.]+$/, "") || "Imported CSV",
    icon: "📊",
    cover: "",
    properties: JSON.stringify({ properties, views: [{ id: "v_default", name: "Table", type: "table" }] }),
    content_order: JSON.stringify([]),
    archived: 0,
    in_trash: 0,
    created_by: opts.userId,
    last_edited_by: opts.userId,
  });
  let inserted = 0;
  for (const r of dataRows) {
    const cells: Record<string, string> = {};
    headers.forEach((_, i) => { cells[`p_${i}`] = r[i] || ""; });
    await cctCreate(NN.block, {
      workspace_id: opts.workspaceId,
      parent_id: dbId,
      type: "row",
      title: r[0] || "",
      icon: "",
      cover: "",
      properties: JSON.stringify({ cells }),
      content_order: JSON.stringify([]),
      archived: 0,
      in_trash: 0,
      created_by: opts.userId,
      last_edited_by: opts.userId,
    });
    inserted++;
  }
  return { databaseId: dbId, rows: inserted };
}
