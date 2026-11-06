import { analyse, readSource } from './live-index';
import { siteInventory, splitSiteEvidence, type SiteBinding, type SitePage } from './site-analysis';

const ROUTES = import.meta.glob(['/src/routes/**/*.tsx', '!/src/routes/__root.tsx', '!/src/routes/api/**'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const APPS = import.meta.glob('/src/pages/*/*App.tsx', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

export async function discoverSitePages(bindings: SiteBinding[]): Promise<SitePage[]> {
  const routes: { path: string; files: string[] }[] = [];
  for (const [file, load] of Object.entries(ROUTES)) {
    const text = await load();
    const path = text.match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
    if (path && path !== '/$') routes.push({ path: path.replace(/_\//g, '/').replace(/\/$/, '') || '/', files: [file.replace('/src/', '')] });
  }
  for (const [file, load] of Object.entries(APPS)) {
    const text = await load();
    const paths = [...text.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map(m => m[1]).filter((path): path is string => !!path && path !== '*');
    for (const path of paths.length ? paths : [`/${file.split('/')[3]}-standalone`]) routes.push({ path, files: [file.replace('/src/', '')] });
  }
  return siteInventory(routes, bindings);
}

/** Traverse current local imports, not a saved code map. Runtime state is not fabricated. */
export async function buildSiteEvidence(page: SitePage): Promise<{ chunks: string[]; omissions: string[]; files: number }> {
  const seen = new Set<string>(); const sources: { file: string; text: string }[] = []; const omissions: string[] = [];
  let frontier = page.files;
  while (frontier.length) {
    const batch = frontier.filter(file => !seen.has(file)); frontier = [];
    for (const file of batch) {
      if (seen.has(file)) continue;
      seen.add(file);
      if (/^(components\/ui\/|components\/inspector\/)/.test(file)) continue;
      const text = await readSource(file);
      if (text === null) { omissions.push(`无法读取 ${file}`); continue; }
      sources.push({ file, text });
      frontier.push(...analyse(file, text).i.filter(next => !seen.has(next)));
    }
  }
  if (!sources.length) omissions.push('没有当前源代码证据');
  omissions.push('本次为全站源代码与保存注释核查，未逐页执行真实账户输入、弹窗、提交和定时任务；不代表运行状态已测试。');
  return { chunks: splitSiteEvidence(sources), omissions, files: sources.length };
}