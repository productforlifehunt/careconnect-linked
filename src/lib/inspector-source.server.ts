import { readSource } from '@/features/inspector/live-index';
import { gatherSourceEvidence, matchesSourceRoute, type SourceSelection } from '@/features/inspector/source-evidence';

const ROUTES = import.meta.glob(['/src/app/routes/**/*.tsx', '!/src/app/routes/api.*'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const APPS = import.meta.glob('/src/pages/*/*App.tsx', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

function pathFromRouteFile(file: string): string {
  const name = file.replace(/^.*\/routes\//, '').replace(/\.(?:tsx|ts)$/, '');
  if (name === 'index') return '/';
  if (name === '$') return '/*';
  return `/${name.split('.').filter(segment => segment && segment !== '_index').map(segment => {
    const clean = segment.replace(/_$/, '');
    return clean === '$' ? '*' : clean.startsWith('$') ? `:${clean.slice(1)}` : clean;
  }).join('/')}`;
}

/** Authenticated callers resolve the deployment's own source, never trust a client code summary. */
export async function readInspectionSource(selection: SourceSelection) {
  const site = new URLSearchParams(selection.page.split('?')[1] || '').get('__site');
  const roots: string[] = [];
  if (site) {
    for (const [file, load] of Object.entries(APPS)) {
      const text = await load();
      const appSite = text.match(/__site[=",\s]+([a-z_]+)/)?.[1]
        || (file.includes('/safety/') ? 'notchsafety' : file.includes('/esm/') ? 'esm_survey' : file.split('/')[3]);
      if (appSite === site) roots.push(file.replace('/src/', ''));
    }
  }
  // The main care site is selected by a URL flag but is not a standalone *App.tsx*.
  // Fall back to its real file route when no standalone site root matched.
  if (!roots.length) {
    const matches = await Promise.all(Object.entries(ROUTES).map(async ([file]) => {
      // The same source reader is used in dev and the deployment; dev reads fresh files.
      const relative = file.replace('/src/', '');
      const text = await readSource(relative);
      const pattern = pathFromRouteFile(file);
      return pattern && matchesSourceRoute(pattern, selection.page) ? { file: relative, pattern } : null;
    }));
    const found = matches.filter((match): match is { file: string; pattern: string } => match !== null);
    // Static routes win over a parameter route that also happens to match.
    found.sort((a, b) => (a.pattern.match(/[$:]/g)?.length || 0) - (b.pattern.match(/[$:]/g)?.length || 0));
    if (found[0]) roots.push(found[0].file);
  }
  const evidence = await gatherSourceEvidence(roots, readSource);
  if (!roots.length) evidence.omissions.unshift(`无法确定 ${selection.page} 的实际页面代码；不能仅分析笔记。`);
  return evidence;
}
