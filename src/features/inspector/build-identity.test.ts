import { expect, it } from 'vitest';
import { inspectorSourcePlugin } from '../../../scripts/inspector-source-plugin';

it('embeds the same visible identities in preview and production after style, text and wrapper edits', async () => {
  const plugin = inspectorSourcePlugin();
  const transform = plugin.transform as (code: string, id: string) => { code: string };
  const file = `${process.cwd()}/src/pages/IdentityFixture.tsx`;
  const before = transform('function Fixture(){return <section><p className="red">1 scheduled</p><Button>Save</Button></section>}', file).code;
  const after = transform('\nfunction Fixture(){return <section><div><p className="blue">pending</p></div><Button>Submit</Button></section>}', file).code;
  const ids = (code: string) => [...code.matchAll(/data-inspector-id="([^"]+)"/g)].map(m => m[1]);
  expect(ids(after).filter(id => !id?.includes('/div/'))).toEqual(ids(before));
  expect(before).toContain('data-inspector-id="pages/IdentityFixture/Fixture/Button/0"');
});
