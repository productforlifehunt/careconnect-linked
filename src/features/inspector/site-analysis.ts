import type { ConflictReport } from './conflict-report';

export interface SiteBinding { key: string; id?: string | undefined; page?: string | undefined; source?: { file: string } | undefined; title?: string | undefined }
export interface SitePage { path: string; files: string[]; noteIds: string[]; elementNotes: number; pageNotes: number }
export interface SitePage { pageNoteIds?: string[] }
export interface SiteResult { page: string; noteId?: string | undefined; chunk: number; chunks: number; report?: ConflictReport | undefined; error?: string | undefined }
export const normaliseSitePath = (path: string) => {
  const [pathname, search = ''] = path.split('?');
  const site = new URLSearchParams(search).get('__site');
  const normal = pathname?.replace(/\/\d+(?=\/|$)/g, '/:id').replace(/\$[\w]+/g, ':id').replace(/:[\w]+/g, ':id').replace(/\/$/, '') || '/';
  return normal + (site ? `?__site=${encodeURIComponent(site)}` : '');
};

/** Route source and explicit bindings both contribute; unbound routes must remain visible. */
export function siteInventory(routes: { path: string; files: string[] }[], bindings: SiteBinding[]): SitePage[] {
  const pages = new Map<string, SitePage>();
  const get = (path: string) => {
    const key = normaliseSitePath(path);
    let page = pages.get(key);
    if (!page) { page = { path: key, files: [], noteIds: [], elementNotes: 0, pageNotes: 0 }; pages.set(key, page); }
    return page;
  };
  for (const route of routes) get(route.path).files.push(...route.files);
  for (const binding of bindings) {
    const parts = binding.key.split('|');
    if (parts[0] !== 'page' && parts[0] !== 'el') continue;
    const path = parts[1] || binding.page;
    if (!path) continue;
    const page = get(path);
    if (binding.id) page.noteIds.push(binding.id);
    if (parts[0] === 'page') { page.pageNotes++; if (binding.id) page.pageNoteIds = [...new Set([...(page.pageNoteIds || []), binding.id])]; } else page.elementNotes++;
    const file = binding.source?.file || (parts[0] === 'el' ? parts[2]?.replace(/:\d+(?::\d+)?$/, '') : undefined);
    if (file && /\.(ts|tsx)$/.test(file)) page.files.push(file.replace(/^\/?src\//, ''));
  }
  return [...pages.values()].map(page => ({ ...page, files: [...new Set(page.files)], noteIds: [...new Set(page.noteIds)] })).sort((a,b) => a.path.localeCompare(b.path));
}

/** No silent truncation: every source line appears in a labelled evidence chunk. */
export function splitSiteEvidence(sources: { file: string; text: string }[], max = 35_000): string[] {
  const chunks: string[] = []; let current = '';
  for (const source of sources) for (const [index, line] of source.text.split('\n').entries()) {
    const entry = `${source.file}:${index + 1} ${line}\n`;
    if (entry.length > max) throw new Error(`${source.file}:${index + 1} 单行超过分析容量，未截断。`);
    if (current.length + entry.length > max) { chunks.push(current); current = ''; }
    current += entry;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function siteTotals(pages: SitePage[], results: SiteResult[], expected: number) {
  const completed = results.filter(r => r.report).length;
  const findings = results.flatMap(r => r.report?.findings || []);
  return { pages: pages.length, processed: results.length, completed, expected, failures: results.filter(r => r.error).length, findings: findings.length, complete: expected > 0 && results.length === expected && completed === expected && !findings.some(f => f.kind === 'missing_evidence') };
}