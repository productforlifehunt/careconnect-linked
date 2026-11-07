import type { NoteBinding } from './cct-notes';
import { routePattern } from './route-key';

/** a59 can contain pre-existing metadata; only inspectorBindings belongs to this feature. */
export function bindingDocument(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null || raw === '') return {};
  const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('a59 现有内容不是对象，未覆盖，请先核查。');
  return value as Record<string, unknown>;
}

export function positionBindings(raw: unknown, id: string): NoteBinding[] {
  const entries = bindingDocument(raw)['inspectorBindings'];
  if (entries === undefined) return [];
  if (!Array.isArray(entries)) throw new Error(`注释 #${id} 的元素绑定格式异常。`);
  return entries.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error(`注释 #${id} 的元素绑定格式异常。`);
    const b = value as NoteBinding;
    if (typeof b.key !== 'string' || !b.key || b.id !== id || !['page', 'element'].includes(b.scope) || typeof b.page !== 'string' || typeof b.label !== 'string') throw new Error(`注释 #${id} 的元素绑定格式异常。`);
    return b;
  });
}

export function samePosition(a: string, b: string): boolean {
  return a === b || (routePattern(a) ?? a) === (routePattern(b) ?? b);
}

export function updatePositionBindings(raw: unknown, bindings: NoteBinding[]): string {
  return JSON.stringify({ ...bindingDocument(raw), inspectorBindings: bindings });
}

export function findPositionBinding(bindings: NoteBinding[], key: string): NoteBinding | undefined {
  const matches = bindings.filter(b => samePosition(b.key, key));
  if (new Set(matches.map(b => b.id)).size > 1) throw new Error('同一元素绑定了不同笔记，请明确重新选择；未自动匹配。');
  return matches.find(b => b.key === key) ?? matches[0];
}