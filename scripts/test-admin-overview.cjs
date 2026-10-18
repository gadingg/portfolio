const test = require('node:test');
const assert = require('node:assert/strict');
const { runtime } = require('./cms-script-runtime.cjs');
const { summarizeWorks, stampWorkUpdates } = runtime()('lib/admin-overview.ts');
const item = (id, extra = {}) => ({ id, kind:'webapp', title:id, description:'', image:'', imageAlt:'', url:'https://example.com', published:true, demo:false, artwork:'hub', ...extra });

test('Tayang uses the public snapshot; drafts and pending deletions do not miscount the collection', () => {
  const published = [item('live'), item('pending-removal'), item('hidden', { published:false })];
  const draft = [item('live', { published:false }), item('new', { published:true }), item('hidden', { published:false, demo:true })];
  const summary = summarizeWorks(draft, published);
  assert.equal(summary.live, 2);
  assert.equal(summary.drafts, 2);
  assert.equal(summary.total, 4);
  assert.equal(summary.total, summary.live + summary.drafts);
  assert.equal(summary.changed, true);
  assert.equal(summary.recent.find(value => value.id === 'live').isLive, true);
  assert.equal(summary.recent.find(value => value.id === 'new').isLive, false);
  assert.equal(summary.examples, 1);
  assert.equal(summary.categories.reduce((sum,value)=>sum+value.total,0),summary.total);
});

test('zero inventory stays zero and known update times precede legacy records without inventing dates', () => {
  assert.deepEqual(summarizeWorks([], []).recent, []);
  assert.equal(summarizeWorks([], []).total, 0);
  const records=[item('legacy'),item('older',{updatedAt:'2026-10-17T12:00:00.000Z'}),item('newer',{updatedAt:'2026-10-18T12:00:00.000Z'})];
  const summary=summarizeWorks(records,records);
  assert.deepEqual(summary.recent.map(value=>value.id),['newer','older','legacy']);
  assert.equal(summary.recent[2].updatedAt,undefined);
  assert.equal(summary.changed,false);
});

test('timestamps are server-derived, unchanged legacy records and reordering retain their actual history', () => {
  const now='2026-10-18T12:00:00.000Z',previous=[item('legacy'),item('known',{createdAt:'2026-10-10T12:00:00.000Z',updatedAt:'2026-10-11T12:00:00.000Z'})];
  const [known,legacy]=stampWorkUpdates(previous,[{...previous[1],updatedAt:now,createdAt:now},Object.fromEntries(Object.entries(previous[0]).reverse())],now);
  assert.equal(known.updatedAt,previous[1].updatedAt); assert.equal(known.createdAt,previous[1].createdAt);
  assert.equal(legacy.updatedAt,undefined);assert.equal(legacy.createdAt,undefined);
  const [changed,created]=stampWorkUpdates(previous,[{...previous[0],title:'Edited'},item('new')],now);
  assert.equal(changed.updatedAt,now);assert.equal(changed.createdAt,undefined);
  assert.equal(created.updatedAt,now);assert.equal(created.createdAt,now);
  assert.equal(previous[0].title,'legacy');
});

test('saving timestamps preserves the public snapshot and publishing retains metadata',async()=>{
  let doc={revision:1,draft:{items:[item('existing')]},published:{items:[item('existing')]}};
  const db=runtime({'./cms':{readCMS:async()=>structuredClone(doc),CMSConflict:Error,writeCMS:async(_id,current,draft,published)=>{doc={revision:current.revision+1,draft,published};return doc;}},'./public-projects':{},'./gallery':{},'@/lib/supabase/public':{},'@/lib/supabase/admin':{},'@/lib/project-presentation':{}})('lib/db/works.ts');
  await db.changeWorks({revision:1,action:'save',items:[item('existing',{title:'Edited'})]});
  assert.equal(doc.published.items[0].title,'existing');assert.ok(doc.draft.items[0].updatedAt);
  const timestamp=doc.draft.items[0].updatedAt;
  await db.changeWorks({revision:2,action:'publish',items:doc.draft.items});
  assert.equal(doc.published.items[0].updatedAt,timestamp);assert.equal(doc.published.items[0].title,'Edited');
  const projected=runtime()('lib/works.ts').publicWork(doc.published.items[0]);
  assert.equal(projected.updatedAt,undefined);assert.equal(projected.createdAt,undefined);
});
