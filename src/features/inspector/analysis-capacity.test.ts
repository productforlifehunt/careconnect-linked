import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    inputValidator: (validate: (input: unknown) => unknown) => ({
      handler: () => ({ validate }),
    }),
  }),
}));
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader: vi.fn() }));

import { explainReadWrite, analyzeSiteNote } from '@/lib/inspector-ai.functions';

const validatorOf = (fn: unknown) => (fn as { validate: (input: unknown) => unknown }).validate;

describe('AI evidence has no application-imposed character cap', () => {
  it('preserves evidence beyond the former 60,000-character page limit', () => {
    const context = '护理读写证据'.repeat(200_000);
    expect(validatorOf(explainReadWrite)({ context })).toEqual({ context });
  });

  it('preserves site evidence beyond the former 40,000-character limit', () => {
    const input = { page: '/cared-ones/46/tips', noteId: '6862', evidence: '护理读写证据'.repeat(200_000), chunk: 1, chunks: 1, omissions: [] };
    expect(validatorOf(analyzeSiteNote)(input)).toEqual(input);
  });

  it('preserves an unsaved note beyond the former 100,000-character limit', () => {
    const input = { context: '代码证据', draft: { title: '护理方法', text: '功能逻辑'.repeat(50_000) } };
    expect(validatorOf(explainReadWrite)(input)).toEqual(input);
  });
});