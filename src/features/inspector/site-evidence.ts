import { analyse, readSource, resolveImport } from './live-index';
import { siteInventory, splitSiteEvidence, type SiteBinding, type SitePage } from './site-analysis';

const ROUTES = import.meta.glob(['/src/app/routes/**/*.tsx', '!/src/app/routes/api.*'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const APPS = import.meta.glob('/src/pages/*/*App.tsx', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

function pathFromRouteFile(file: string): string {
  const name = file.replace(/^.*\/routes\//, '').replace(/\.(?:tsx|ts)$/, '');
  if (name === 'index') return '/';
  if (name === '$') return '/*';
  const segments = name.split('.').filter(segment => segment && segment !== '_index').map(segment => {
    const clean = segment.replace(/_$/, '');
    return clean === '$' ? '*' : clean.startsWith('$') ? `:${clean.slice(1)}` : clean;
  });
  return `/${segments.join('/')}`;
}

export async function discoverSitePages(bindings: SiteBinding[]): Promise<SitePage[]> {
  const routes: { path: string; files: string[] }[] = [];
  const routeEntries = Object.entries(ROUTES);
  for (let index = 0; index < routeEntries.length; index += 6) {
    await Promise.all(routeEntries.slice(index, index + 6).map(async ([file, load]) => {
    const text = await load();
    const path = pathFromRouteFile(file);
    if (path !== '/*') routes.push({ path, files: [file.replace('/src/', '')] });
    }));
  }
  for (const [file, load] of Object.entries(APPS)) {
    const text = await load();
    const site = text.match(/__site[=",\s]+([a-z_]+)/)?.[1] || (file.includes('/safety/') ? 'notchsafety' : file.includes('/esm/') ? 'esm_survey' : file.split('/')[3]) || 'unknown';
    const paths = [...text.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map(m => m[1]).filter((path): path is string => !!path && path !== '*');
    for (const path of paths.length ? paths : ['/']) routes.push({ path: `${path}?__site=${site}`, files: [file.replace('/src/', '')] });
  }
  return siteInventory(routes, bindings);
}

/** Traverse current local imports, not a saved code map. Runtime state is not fabricated. */
export async function buildSiteEvidence(page: SitePage, read: (file: string) => Promise<string | null> = readSource): Promise<{ chunks: string[]; omissions: string[]; files: number }> {
  const seen = new Set<string>(); const sources: { file: string; text: string }[] = []; const omissions: string[] = [];
  let frontier = page.files;
  while (frontier.length) {
    const batch = frontier.filter(file => !seen.has(file)); frontier = [];
    for (let index = 0; index < batch.length; index += 6) await Promise.all(batch.slice(index, index + 6).map(async file => {
      if (seen.has(file)) return;
      seen.add(file);
      if (/^(components\/ui\/|components\/inspector\/|i18n\/locales\/)/.test(file)) return;
      const text = await read(file);
      if (text === null) { omissions.push(`无法读取 ${file}`); return; }
      sources.push({ file, text });
      for (const match of text.matchAll(/(?:import|export)[^"'`]*?from\s*["'`]([^"'`]+)["'`]|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
        const spec = match[1] || match[2];
        if (spec && /^(?:@\/|\.)/.test(spec) && !resolveImport(file, spec) && !/\.(?:css|json|jpg|png|webp|asset\.json)$/.test(spec)) omissions.push(`未解析本地依赖 ${file} → ${spec}；不能据此认定完整一致。`);
      }
      frontier.push(...analyse(file, text).i.filter(next => !seen.has(next)));
    }));
  }
  if (!sources.length) omissions.push('没有当前源代码证据');
  omissions.push('本次为全站源代码与保存注释核查，未逐页执行真实账户输入、弹窗、提交和定时任务；不代表运行状态已测试。');
  return { chunks: splitSiteEvidence(sources.sort((a,b) => a.file.localeCompare(b.file))), omissions: [...new Set(omissions)], files: sources.length };
}
