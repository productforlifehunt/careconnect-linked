import { describe, expect, it } from 'vitest';
import { formatSourceEvidence, gatherSourceEvidence, matchesSourceRoute } from './source-evidence';

describe('actual source in preview and published analysis', () => {
  it('resolves the medicine/tips page without any source tags or line numbers', () => {
    expect(matchesSourceRoute('/cared-ones/$personId/$card', '/cared-ones/46/medicine')).toBe(true);
    expect(matchesSourceRoute('/cared-ones/$personId/$card', '/cared-ones/46/tips')).toBe(true);
    expect(matchesSourceRoute('/care-circle/$groupId', '/care-circle/22')).toBe(true);
    expect(matchesSourceRoute('/care-circle/$groupId', '/cared-ones/46/tips')).toBe(false);
    expect(matchesSourceRoute('/$', '/unknown')).toBe(false);
  });
  it('includes actual frontend code and imported read/write helpers, not only endpoint snippets', async () => {
    const source: Record<string, string> = {
      'pages/CaredOnes.tsx': 'import { scheduleTimeColumns } from "@/features/schedules/calendar-schedule";\nconst selected = "medicine";',
      'features/schedules/calendar-schedule.ts': 'export const scheduleTimeColumns = { start: "a57", end: "a58", recurrence: "a66" };',
    };
    const result = await gatherSourceEvidence(['pages/CaredOnes.tsx'], async file => source[file] ?? null);
    expect(result.files.some(file => file.file === 'pages/CaredOnes.tsx')).toBe(true);
    expect(formatSourceEvidence(result)).toContain('const selected = "medicine"');
    expect(result.files.length).toBe(2);
    expect(formatSourceEvidence(result)).toContain('start: "a57"');
  });
  it('does not truncate actual code past the old 60,000-character limit', async () => {
    const text = 'const evidence = "护理读写";\n'.repeat(10_000) + 'const lastRule = "REL191";';
    const result = await gatherSourceEvidence(['pages/CaredOnes.tsx'], async () => text);
    expect(result.files[0]?.text).toBe(text);
    expect(formatSourceEvidence(result)).toContain('const lastRule = "REL191";');
  });
  it('reports absent source rather than claiming code was checked', async () => {
    const result = await gatherSourceEvidence(['missing.tsx'], async () => null);
    expect(result.files).toHaveLength(0);
    expect(result.omissions).toContain('没有实际源代码，三方核对未执行。');
  });
});
it('matches un-nested and pathless route ids to their URL', async () => {
  const { matchesSourceRoute } = await import('./source-evidence');
  expect(matchesSourceRoute('/care-circle_/$groupId', '/care-circle/28')).toBe(true);
  expect(matchesSourceRoute('/_authenticated/dashboard', '/dashboard')).toBe(true);
  expect(matchesSourceRoute('/care-circle', '/care-circle/28')).toBe(false);
});
