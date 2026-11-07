import { describe, expect, it } from 'vitest';
import { matchingLegacyLabel } from './legacy-match';

describe('legacy line-only bindings', () => {
  it('accepts a changed count while checking the remaining visible text', () => {
    expect(matchingLegacyLabel('<p> 1 scheduled · CardContent', '<p> 12 scheduled · CardContent')).toBe(true);
    expect(matchingLegacyLabel('<p> 1 scheduled · CardContent', '<p> 1 pending · CardContent')).toBe(false);
  });
  it('does not guess for an empty or numeric-only label', () => {
    expect(matchingLegacyLabel('<span> 1 · Card', '<span> 2 · Card')).toBe(false);
  });
});
