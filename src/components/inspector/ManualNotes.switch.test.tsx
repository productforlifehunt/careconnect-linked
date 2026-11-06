import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const TITLE = 'el|/cared-ones/:id/notes|CardContent<Card<NotesCard|@div[*]>span0';
const CONTENT = 'el|/cared-ones/:id/notes|CardContent<Card<NotesCard|@div[*]>span1';
const mocks = vi.hoisted(() => ({ save: vi.fn(), select: vi.fn(), cached: true }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/inspector-ai.functions', () => ({ explainReadWrite: vi.fn() }));
vi.mock('@/lib/inspector-notes.functions', () => ({ loadAllInspectorNotes: vi.fn(), loadInspectorNotes: vi.fn(), saveInspectorNote: mocks.save, selectInspectorNote: mocks.select }));
vi.mock('@/services/wp-auth', () => ({ getWPToken: () => 'test-session' }));
vi.mock('@/features/inspector/notes-cache', () => ({ inspectorNotesCache: {
  // Only the title element is bound to #10531; the content element has no note of its own.
  peek: () => (mocks.cached ? new Map([[TITLE, { key: TITLE, id: '10531', title: '护理笔记内容', text: '', locked: true, updatedAt: '2026-11-06' }]]) : null),
  load: () => Promise.reject(new Error('读取失败')),
  put: vi.fn(), reset: vi.fn(),
} }));
vi.mock('./RelatedNotes', () => ({ RelatedNotes: () => null }));
import { ManualNotes } from './ManualNotes';

afterEach(() => { cleanup(); vi.clearAllMocks(); mocks.cached = true; });

it('a note shown for one element can never be saved onto the next selected element', async () => {
  const view = render(<ManualNotes noteKey={TITLE} scope="element" page="/cared-ones/46/notes" label="<span> 护理笔记1标题" />);
  await waitFor(() => expect(screen.getByText(/CCT324 #10531/)).toBeDefined());
  // Switch to the content element while the notes list has to be read again and that read fails.
  mocks.cached = false;
  view.rerender(<ManualNotes noteKey={CONTENT} scope="element" page="/cared-ones/46/notes" label="<span> 护理笔记1内容" />);
  await waitFor(() => expect(screen.getByText('读取失败', { exact: false })).toBeDefined());
  expect(screen.queryByText(/#10531/)).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: '' }) as HTMLElement, { target: { value: '写点东西' } });
  fireEvent.click(screen.getByRole('button', { name: '保存注释' }));
  expect(mocks.save).not.toHaveBeenCalled();
});
