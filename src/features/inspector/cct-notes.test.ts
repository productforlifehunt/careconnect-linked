import { expect, it } from 'vitest';
import { bindCCTNotes, noteCatalogue, replaceCCTNote } from './cct-notes';

const rows = [
  { key: 'cct|1', id: '1', title: '社区整页', text: '正文一', updatedAt: 'today' },
  { key: 'cct|2', id: '2', title: '点赞数', text: '正文二', updatedAt: 'today' },
];
it('stores exactly one selected note per page or element, with the explicit selection winning', () => {
  const notes = bindCCTNotes(rows, [
    { key: 'page|/community', id: '1', scope: 'page', page: '/community', label: '社区' },
    { key: 'page|/community', id: '2', scope: 'page', page: '/community', label: '社区', locked: true },
  ]);
  expect(notes.filter(n => n.key === 'page|/community')).toHaveLength(1);
  expect(notes.find(n => n.key === 'page|/community')).toMatchObject({id:'2', text:'正文二', locked:true});
});
it('never replaces a missing selected CCT row with another note', () => {
  expect(() => bindCCTNotes(rows, [{key:'el|x',id:'3',scope:'element',page:'/community',label:'x'}])).toThrow('#3');
});
it('offers existing notes once even when several positions use the same note', () => {
  const notes = bindCCTNotes(rows, [{key:'page|/community',id:'1',scope:'page',page:'/community',label:'社区'}]);
  expect(noteCatalogue(new Map(notes.map(n=>[n.key,n]))).map(n=>n.id)).toEqual(['2','1']);
});
it('editing a CCT note updates every cached position using it without changing any binding', () => {
  const notes = bindCCTNotes(rows, [{key:'el|x',id:'1',scope:'element',page:'/community',label:'x',locked:true}]);
  const first = rows[0]; if (!first) throw new Error('missing fixture');
  const map = replaceCCTNote(new Map(notes.map(n=>[n.key,n])), {...first,text:'已编辑',title:'新名字'});
  expect(map.get('el|x')).toMatchObject({id:'1',text:'已编辑',title:'新名字',locked:true});
  expect(map.get('cct|2')?.text).toBe('正文二');
});
it('saving manual verification updates every position sharing that CCT324 note', () => {
  const notes = bindCCTNotes(rows, [{key:'el|x',id:'1',scope:'element',page:'/community',label:'x',locked:true}]);
  const first = rows[0]; if (!first) throw new Error('missing fixture');
  const checked = replaceCCTNote(new Map(notes.map(n=>[n.key,n])), {...first,verified:true});
  expect(checked.get('el|x')).toMatchObject({id:'1',verified:true,locked:true});
  const unchecked = replaceCCTNote(checked, {...first,verified:false});
  expect(unchecked.get('el|x')).toMatchObject({id:'1',verified:false,locked:true});
  expect(unchecked.get('cct|2')).not.toHaveProperty('verified');
});