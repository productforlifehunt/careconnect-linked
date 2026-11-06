import type { ConflictReport } from './conflict-report';

export interface SiteBinding { key: string; id?: string | undefined; page?: string | undefined; source?: { file: string } | undefined; title?: string | undefined }
export interface SitePage { path: string; files: string[]; noteIds: string[]; elementNotes: number; pageNotes: number; pageNoteIds?: string[] }
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
  const grouped = new Map<string, SiteResult[]>();
  for (const result of results) { const key = `${result.page}|${result.noteId || 'unbound'}`; grouped.set(key, [...(grouped.get(key) || []), result]); }
  const completeNotes = [...grouped.values()].filter(group => {
    const first = group[0]; if (!first?.noteId) return false;
    return group.length === first.chunks && new Set(group.map(r => r.chunk)).size === first.chunks && group.every(r => r.report && !r.error && !r.report.findings.some(f => f.kind === 'missing_evidence'));
  }).length;
  const boundNotes = pages.reduce((sum, page) => sum + page.noteIds.length, 0);
  return { pages: pages.length, processed: results.length, completed, expected, completeNotes, boundNotes, failures: results.filter(r => r.error).length, findings: findings.length, complete: expected > 0 && results.length === expected && completed === expected && completeNotes === boundNotes && !findings.some(f => f.kind === 'missing_evidence') };
}

export function siteMarkdownReport(pages: SitePage[], results: SiteResult[], expected: number): string {
  const totals = siteTotals(pages, results, expected);
  const lines = ['# 全站读写冲突报告', `生成时间：${new Date().toISOString()}`, '', '范围：当前源代码、保存的整页与元素注释及各自直接 REL325 关联注释。不是逐页真实运行测试；未关联注释不作任意两两比较。', '', `页面范围 ${totals.pages}；已返回 ${totals.processed}/${totals.expected} 项；失败 ${totals.failures} 项；冲突或疑点 ${totals.findings} 项；证据完整的注释 ${totals.completeNotes}/${totals.boundNotes}。`, `完成状态：${totals.complete ? '本次静态核查范围已完成' : '未完成，不能认定全站一致'}`];
  for (const page of pages) {
    lines.push('', `## ${page.path}`, `整页绑定 ${page.pageNotes}；元素绑定 ${page.elementNotes}`);
    const rows = results.filter(r => r.page === page.path);
    if (!rows.length) lines.push('尚未分析。');
    for (const row of rows) {
      lines.push('', `### 注释 ${row.noteId ? `#${row.noteId}` : '未绑定'} · 代码分片 ${row.chunk}/${row.chunks}`);
      if (row.error) lines.push(`未完成：${row.error}`);
      if (row.report) {
        lines.push(row.report.summary, `比对注释：${row.report.comparedNoteIds.map(id => `#${id}`).join('、')}；注释两两比较 ${row.report.comparedPairs.length} 组。`);
        for (const [index, finding] of row.report.findings.entries()) lines.push('', `#### ${index + 1}. ${finding.title}（${finding.kind}）`, `涉及注释：${finding.noteIds.map(id => `#${id}`).join('、') || '无'}`, `证据：${finding.evidence}`, `判定：${finding.verdict}`, `建议：${finding.fix}`);
      }
    }
  }
  return lines.join('\n\n');
}