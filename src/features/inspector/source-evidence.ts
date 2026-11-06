import { analyse, resolveImport } from './live-index';

export interface SourceSelection {
  page: string;
  components?: string[];
  sources?: string[];
}
export interface SourceEvidence {
  roots: string[];
  files: { file: string; text: string }[];
  omissions: string[];
}

/** Match route parameters without depending on DOM tags, source lines or account ids. */
export function matchesSourceRoute(pattern: string, page: string): boolean {
  const path = page.split('?')[0]?.replace(/\/$/, '') || '/';
  const route = pattern.replace(/\/$/, '') || '/';
  if (route === '/$') return false;
  const parts = route.split('/').map(part => part.startsWith('$') || part.startsWith(':')
    ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^${parts.join('/')}$`).test(path);
}

/** Every dependency is read, not just extracted endpoint snippets. No character cap. */
export async function gatherSourceEvidence(roots: string[], read: (file: string) => Promise<string | null>): Promise<SourceEvidence> {
  const files: SourceEvidence['files'] = [];
  const omissions: string[] = [];
  const seen = new Set<string>();
  let frontier = [...new Set(roots)];
  while (frontier.length) {
    const batch = frontier.filter(file => !seen.has(file));
    frontier = [];
    for (let index = 0; index < batch.length; index += 8) {
      await Promise.all(batch.slice(index, index + 8).map(async file => {
        if (seen.has(file)) return;
        seen.add(file);
        if (/^(components\/(?:ui|inspector)\/|features\/inspector\/|i18n\/locales\/)/.test(file)) return;
        // The schema is supplied separately as dictionary evidence, never regenerated.
        if (file === 'integrations/wp-schema.ts') return;
        try {
          const text = await read(file);
          if (!text?.trim()) { omissions.push(`无法读取实际代码：${file}`); return; }
          files.push({ file, text });
          frontier.push(...analyse(file, text).i.filter(next => !seen.has(next)));
          for (const match of text.matchAll(/(?:import|export)[^"'`]*?from\s*["'`]([^"'`]+)["'`]|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
            const spec = match[1] || match[2];
            if (spec && /^(?:@\/|\.)/.test(spec) && !resolveImport(file, spec)
              && spec !== '@/integrations/wp-schema'
              && !/features\/inspector\//.test(spec)
              && !/integrations\/supabase\//.test(spec)
              && !/\.(?:css|json|jpg|jpeg|png|webp|svg|woff2?)$/.test(spec)) {
              omissions.push(`未解析实际代码依赖：${file} → ${spec}`);
            }
          }
        } catch (error) { omissions.push(`代码读取失败：${file}（${error instanceof Error ? error.message : String(error)}）`); }
      }));
    }
  }
  if (!files.length) omissions.push('没有实际源代码，三方核对未执行。');
  return { roots, files: files.sort((a, b) => a.file.localeCompare(b.file)), omissions: [...new Set(omissions)] };
}

export function formatSourceEvidence(evidence: SourceEvidence): string {
  return evidence.files.map(({ file, text }) => text.split('\n').map((line, index) => `${file}:${index + 1} ${line}`).join('\n')).join('\n\n');
}