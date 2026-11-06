import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ on: false, load: vi.fn() }));
vi.mock('@/features/inspector/recorder', () => ({ isResearcherAccount: () => true, inspectModeOn: () => state.on, setInspectMode: (on: boolean) => { state.on = on; } }));
vi.mock('@/services/wp-auth', () => ({ getWPToken: () => 'test-session' }));
vi.mock('@/features/inspector/notes-cache', () => ({ inspectorNotesCache: { reset: vi.fn(), load: state.load } }));
vi.mock('./ReadWriteInspector', () => ({ default: () => <div>Inspector opened</div> }));
import { InspectorGate } from './InspectorGate';
afterEach(() => { cleanup(); state.on = false; vi.clearAllMocks(); });
it('does not load private note catalogue before the researcher opens the inspector', async () => {
  render(<InspectorGate />);
  expect(state.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '读写核对 / Inspect' }));
  expect(await screen.findByText('Inspector opened')).toBeInTheDocument();
  expect(state.on).toBe(true);
});