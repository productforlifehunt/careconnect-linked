import { describe, expect, it } from 'vitest';
import { inspectorTarget, stableAnchor, stableElementKey } from './inspect-dom';

describe('published visible slot identity', () => {
  it('ignores text, status, colour, source tags and inserted layout wrappers', () => {
    const host = document.createElement('div');
    host.innerHTML = '<section><p data-inspector-id="Dashboard/stats/p/0">1 scheduled</p></section>';
    const p = host.querySelector('p')!;
    const key = () => stableElementKey('/dashboard', stableAnchor(p));
    const before = key();
    p.textContent = 'pending'; p.className = 'text-red-500';
    const wrapper = document.createElement('div'); p.replaceWith(wrapper); wrapper.append(p);
    expect(key()).toBe(before);
    p.setAttribute('data-tsd-source', 'changed.tsx:999');
    expect(key()).toBe(before);
  });
  it('normalizes icons and captions inside controls without merging fields', () => {
    const host = document.createElement('div');
    host.innerHTML = '<input data-inspector-id="Form/name/input/0"><input data-inspector-id="Form/email/input/0"><button data-inspector-id="Form/save/button/0"><span>Save</span><svg></svg></button>';
    const keys = [...host.querySelectorAll('input,button')].map(el => stableElementKey('/settings', stableAnchor(el)));
    expect(new Set(keys).size).toBe(3);
    expect(inspectorTarget(host.querySelector('span')!)).toBe(host.querySelector('button'));
    expect(inspectorTarget(host.querySelector('svg')!)).toBe(host.querySelector('button'));
  });
  it('keeps portal AI controls independent of the underlying page', () => {
    const host = document.createElement('div');
    host.innerHTML = '<div data-inspector-scope="ai-chat-dialog"><textarea data-inspector-id="AI/message/textarea/0"></textarea></div>';
    const anchor = stableAnchor(host.querySelector('textarea')!);
    expect(stableElementKey('/dashboard', anchor)).toBe(stableElementKey('/inbox', anchor));
  });
});
