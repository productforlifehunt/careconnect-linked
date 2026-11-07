import { describe, expect, it } from 'vitest';
import { readInspectionSource } from './inspector-source.server';

describe('deployment-compatible actual route source', () => {
  it('reads the real medicine frontend and its read/write helpers without DOM source markers', async () => {
    const result = await readInspectionSource({ page: '/cared-ones/46/medicine' });
    expect(result.roots).toEqual(["app/routes/cared-ones.$personId.$card.tsx"]);
    expect(result.files.some(source => source.file === 'pages/CaredOnes.tsx')).toBe(true);
    expect(result.files.some(source => source.file === 'features/schedules/calendar-schedule.ts')).toBe(true);
    const code = result.files.map(source => source.text).join('\n');
    expect(code).toContain('scheduleTimeColumns');
    expect(code).toContain('R.medicineScheduleLogs');
    expect(result.files.length).toBeGreaterThan(3);
  }, 30_000);

  it('resolves tips to its actual frontend, not a cached medicine summary', async () => {
    const result = await readInspectionSource({ page: '/cared-ones/46/tips' });
    expect(result.files.some(source => source.file === 'components/cared-ones/TipsCard.tsx')).toBe(true);
    expect(result.files.find(source => source.file === 'components/cared-ones/TipsCard.tsx')?.text).toContain('useCareTips');
  }, 30_000);

  it('resolves main care routes when the selected site is carried in the query string', async () => {
    const result = await readInspectionSource({ page: '/search-local-caregiver?__site=challenged' });
    expect(result.roots).toEqual(["app/routes/search-local-caregiver.tsx"]);
    expect(result.files.some(source => source.file === 'pages/SearchResults.tsx')).toBe(true);
    expect(result.omissions).not.toContain('没有实际源代码，三方核对未执行。');
  }, 30_000);

  it('fails closed for an unknown page rather than treating notes alone as actual code', async () => {
    const result = await readInspectionSource({ page: '/not-a-real-inspector-page' });
    expect(result.files).toHaveLength(0);
    expect(result.omissions.join('\n')).toContain('不能仅分析笔记');
  }, 30_000);
});
