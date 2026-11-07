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

it('does not move a control binding when its value, checked state, color, or text changes', () => {
  const plugin = inspectorSourcePlugin();
  const transform = plugin.transform as (code: string, id: string) => { code: string };
  const file = `${process.cwd()}/src/pages/IdentityFixture.tsx`;
  const before = transform(
    'function Fixture(){return <Form><input name="dose" value="10" checked={false} className="text-blue-500" /><button>Save 10</button></Form>}',
    file,
  ).code;
  const after = transform(
    'function Fixture(){return <Form><input name="dose" value="20" checked={true} className="text-red-500" /><button>Save 20</button></Form>}',
    file,
  ).code;
  const ids = (code: string) => [...code.matchAll(/data-inspector-id="([^"]+)"/g)].map((m) => m[1]);
  expect(ids(after)).toEqual(ids(before));
});

it('tags static interactive components such as tabs even when their labels are literal', () => {
  const plugin = inspectorSourcePlugin();
  const transform = plugin.transform as (code: string, id: string) => { code: string };
  const file = `${process.cwd()}/src/pages/IdentityFixture.tsx`;
  const before = transform(
    'function Fixture(){return <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><Button>Help</Button></TabsList>}',
    file,
  ).code;
  const after = transform(
    'function Fixture(){return <TabsList><TabsTrigger value="all">全部</TabsTrigger><TabsTrigger value="notifications">通知</TabsTrigger><Button>帮助</Button></TabsList>}',
    file,
  ).code;
  const ids = (code: string) => [...code.matchAll(/data-inspector-id="([^"]+)"/g)].map((m) => m[1]);
  expect(new Set(ids(before)).size).toBe(3);
  expect(ids(after)).toEqual(ids(before));
  expect(before).toContain('data-inspector-source=');
});
