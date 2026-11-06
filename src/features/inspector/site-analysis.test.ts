import { describe, expect, it } from 'vitest';
import { normaliseSitePath, siteInventory, siteTotals, splitSiteEvidence } from './site-analysis';

describe('whole-site inventory and evidence coverage', () => {
  it('keeps unbound routes, merges record instances, and includes page and element notes', () => {
    const pages = siteInventory([{ path: '/care-circle/$groupId', files: ['routes/group.tsx'] }, { path: '/inbox', files: ['pages/Inbox.tsx'] }], [
      { key: 'page|/care-circle/28', id: '1' },
      { key: 'el|/care-circle/31|components/Count.tsx:12|span', id: '2' },
      { key: 'el|/care-circle/28|components/Count.tsx:14|span', id: '2' },
      { key: 'cct|999', id: '999' },
    ]);
    expect(pages).toHaveLength(2);
    expect(pages[0]).toEqual({ path: '/care-circle/:id', files: ['routes/group.tsx','components/Count.tsx'], noteIds: ['1','2'], pageNoteIds: ['1'], elementNotes: 2, pageNotes: 1 });
    expect(pages[1]?.noteIds).toEqual([]);
    expect(normaliseSitePath('/care-circle/:groupId/')).toBe('/care-circle/:id');
  });
  it('never merges different standalone sites sharing the same URL pathname', () => {
    const pages = siteInventory([{path:'/?__site=notchsafety', files:['safety.tsx']},{path:'/?__site=esm_survey', files:['survey.tsx']}], []);
    expect(pages).toHaveLength(2);
    expect(pages.map(p => p.path)).toEqual(['/?__site=esm_survey','/?__site=notchsafety']);
  });
  it('includes all source lines exactly once across chunks with file and line evidence', () => {
    const chunks = splitSiteEvidence([{ file: 'a.ts', text: 'first\nsecond\nthird' }], 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe('a.ts:1 first\na.ts:2 second\na.ts:3 third\n');
    expect(chunks.every(chunk => chunk.length <= 20)).toBe(true);
    expect(() => splitSiteEvidence([{ file:'a.ts', text:'x'.repeat(30) }], 20)).toThrow('未截断');
  });
  it('cannot mark partial, failed, or missing evidence reports as complete', () => {
    const report = { summary:'tested', comparedNoteIds:['1'], comparedCodeNoteIds:['1'],comparedPairs:[],codeCompared:true, findings:[] };
    expect(siteTotals([], [{ page:'/', chunk:1, chunks:1, report }], 2).complete).toBe(false);
    expect(siteTotals([], [{ page:'/', chunk:1, chunks:1,error:'denied' }], 1).complete).toBe(false);
    expect(siteTotals([], [{ page:'/', chunk:1, chunks:1,report:{...report,findings:[{kind:'missing_evidence', title:'missing',noteIds:[],evidence:'missing code',verdict:'unknown',fix:'read code'}]} }], 1).complete).toBe(false);
    expect(siteTotals([], [{ page:'/', chunk:1,chunks:1,report }],1).complete).toBe(true);
  });
});