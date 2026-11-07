import { describe, expect, it } from 'vitest';
import { analyzeSiteNoteInput, explainReadWriteInput } from '@/lib/inspector-ai.functions.server';

describe('AI evidence has no application-imposed character cap', () => {
  it('preserves evidence beyond the former 60,000-character page limit', () => {
    const context = '护理读写证据'.repeat(200_000);
    expect(explainReadWriteInput.parse({ context })).toEqual({ context });
  });

  it('preserves site evidence beyond the former 40,000-character limit', () => {
    const input = { page: '/cared-ones/46/tips', noteId: '6862', evidence: '护理读写证据'.repeat(200_000), chunk: 1, chunks: 1, omissions: [] };
    expect(analyzeSiteNoteInput.parse(input)).toEqual(input);
  });

  it('preserves an unsaved note beyond the former 100,000-character limit', () => {
    const input = { context: '代码证据', draft: { title: '护理方法', text: '功能逻辑'.repeat(50_000) } };
    expect(explainReadWriteInput.parse(input)).toEqual(input);
  });
});
