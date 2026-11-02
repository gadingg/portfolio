const test = require('node:test');
const assert = require('node:assert/strict');
const {runtime} = require('./cms-script-runtime.cjs');
const {NextRequest} = require('next/server');
const trash = runtime()('lib/work-trash.ts');
const now = Date.parse('2026-11-02T10:00:00Z');
const work = (id, patch = {}) => ({id, kind:'webapp', title:id, description:'', image:'/api/media/works/test.png',
  imageAlt:'', url:'https://example.com', published:true, demo:false, artwork:'hub', ...patch});

test('trash removes both snapshots immediately and restores distinct draft/public state and positions', () => {
  for (const published of [true, false]) {
    const draft = {items:[work('before'),work('target',{title:'Unsaved draft'}),work('after')]};
    const live = {items:[work('target',{title:'Public copy',published}),work('other')]};
    const next = trash.moveWorkToTrash(draft,live,'target',undefined,now);
    assert.deepEqual(next.draft.items.map(item=>item.id),['before','after']);
    assert.deepEqual(next.published.items.map(item=>item.id),['other']);
    assert.equal(Date.parse(next.entry.expiresAt)-now,72*3600000);
    const restored = trash.restoreTrashedWork(next.draft,next.published,'target',now+1000);
    assert.deepEqual(restored.draft.items,draft.items); assert.deepEqual(restored.published.items,live.items);
    assert.equal(restored.draft.trash.length,0); assert.equal(draft.items.length,3);
  }
});
test('new drafts remain drafts, unsaved selected content is retained, and unrelated records stay unchanged', () => {
  const existing={items:[work('existing')]}, live={items:[work('existing')]}, selected=work('new',{title:'Latest local content'});
  const next=trash.moveWorkToTrash(existing,live,'new',selected,now);
  assert.equal(next.entry.draft.title,selected.title); assert.equal(next.entry.published,undefined);
  assert.deepEqual(next.published,live);
  const result=trash.restoreTrashedWork(next.draft,next.published,'new',now);
  assert.equal(result.draft.items[1].title,selected.title);assert.deepEqual(result.published,live);
});
test('restore rejects expiry at exactly 72h, duplicate identity, slug and homepage collisions', () => {
  const next=trash.moveWorkToTrash({items:[work('one')]},{items:[]},'one',undefined,now);
  assert.throws(()=>trash.restoreTrashedWork(next.draft,next.published,'one',now+trash.trashRetentionMs),/habis/);
  assert.throws(()=>trash.restoreTrashedWork({...next.draft,items:[work('one')]},next.published,'one',now),/ID/);
  assert.throws(()=>trash.moveWorkToTrash(next.draft,next.published,'one',undefined,now),/sudah/);
  const featured=trash.moveWorkToTrash({items:[work('featured',{homepageFeatured:true})]},{items:[]},'featured',undefined,now);
  assert.throws(()=>trash.restoreTrashedWork({...featured.draft,items:[1,2,3].map(id=>work(String(id),{homepageFeatured:true}))},featured.published,'featured',now),/unggulan/);
  assert.equal(trash.trashTimeLeft(next.entry,now),'Sisa 3 hari');
});
test('trash mutations enforce revisions, persist once and do not publish unrelated drafts', async () => {
  let doc={revision:4,draft:{items:[work('target'),work('other',{title:'Draft edit'})]},published:{items:[work('target'),work('other')]}}, writes=0;
  const db=runtime({'./cms':{readCMS:async()=>structuredClone(doc),CMSConflict:class Conflict extends Error{},
    writeCMS:async(_id,current,draft,published)=>{writes++;doc={revision:current.revision+1,draft,published};return structuredClone(doc);}}})('lib/db/works.ts');
  await assert.rejects(db.changeWorkTrash({action:'move',id:'target',revision:3}));
  assert.equal(writes,0);
  await db.changeWorkTrash({action:'move',id:'target',revision:4});
  assert.equal(writes,1);assert.equal(doc.published.items[0].title,'other');
  await assert.rejects(db.changeWorks({action:'save',revision:5,items:[work('target')]}));
  await db.changeWorkTrash({action:'restore',id:'target',revision:5});
  assert.equal(doc.draft.items[1].title,'Draft edit');assert.equal(doc.published.items[1].title,'other');
});
test('owned media extraction includes archived, HTML and signed refs, ignoring foreign buckets and traversal', () => {
  const {ownedMediaRefs,validCleanupKey}=runtime()('lib/trash-media.ts');
  const refs=ownedMediaRefs({archivedCaseStudy:{html:'<img src="/api/media/works/a.png?w=640"> /api/media/works/shared.jpg is used.'},
    video:'https://project.supabase.co/storage/v1/object/sign/portfolio-cms-media/works/video.mp4?token=secret',
    image:'https://foreign.supabase.co/storage/v1/object/public/portfolio-public/works/no.png',
    pendingMediaCleanup:['portfolio-cms-media/works/ignored.png']},'https://project.supabase.co');
  assert.deepEqual(refs.sort(),['portfolio-cms-media/works/a.png','portfolio-cms-media/works/shared.jpg','portfolio-cms-media/works/video.mp4'].sort());
  for(const key of ['other/works/a.png','portfolio-cms-media/works/../a.png','portfolio-cms-media/cv/a.exe'])assert.equal(validCleanupKey(key),false);
});
function cleanupHarness({storageFails=false,referenceFails=false}={}) {
  const old=trash.moveWorkToTrash({items:[work('expired',{image:'/api/media/works/unused.png',archivedCaseStudy:{image:'/api/media/works/shared.png'}})]},{items:[]},'expired',undefined,now);
  const fresh=trash.moveWorkToTrash(old.draft,old.published,'fresh',work('fresh'),now+trash.trashRetentionMs-1000);
  let doc={revision:1,draft:fresh.draft,published:fresh.published}, removed=[];
  const client={from:table=>({select:()=>({order:()=>({range:async()=>({error:referenceFails?Error('storage'):null,
    data:table==='portfolio_cms_documents'?[{id:'works',...structuredClone(doc)},{id:'site',revision:1,draft:{layout:'<img src="/api/media/works/shared.png">'},published:{}}]:[]})})})}),
    storage:{from:bucket=>({remove:async paths=>{if(storageFails)return {error:Error('storage')};removed.push(...paths.map(path=>bucket+'/'+path));return {error:null};}})}};
  const cleanup=runtime({'@/lib/supabase/admin':{createAdminClient:()=>client},'./works':{initialWorks:async()=>({items:[]})},
    './cms':{readCMS:async()=>structuredClone(doc),writeCMS:async(_id,current,draft,published)=>{assert.equal(current.revision,doc.revision);doc={revision:current.revision+1,draft,published};return structuredClone(doc);}}})('lib/db/trash-cleanup.ts');
  return {cleanup,get doc(){return doc;},removed};
}
test('scheduled cleanup purges only expired entries and unused media, retaining shared files and unexpired trash', async () => {
  const h=cleanupHarness();const result=await h.cleanup.cleanupWorkTrash(now+trash.trashRetentionMs);
  assert.equal(result.purged,1);assert.deepEqual(h.doc.draft.trash.map(entry=>entry.id),['fresh']);
  assert.deepEqual(h.removed,['portfolio-cms-media/works/unused.png']);
  assert.equal(h.doc.draft.pendingMediaCleanup.length,0);
  const again=await h.cleanup.cleanupWorkTrash(now+trash.trashRetentionMs);
  assert.equal(again.purged,0);assert.equal(h.removed.length,1);
});
test('failed media cleanup stays queued; unreadable references prevent storage removal', async () => {
  let h=cleanupHarness({storageFails:true}); await h.cleanup.cleanupWorkTrash(now+trash.trashRetentionMs);
  assert.equal(h.doc.draft.pendingMediaCleanup.includes('portfolio-cms-media/works/unused.png'),true);
  h=cleanupHarness({referenceFails:true});await assert.rejects(h.cleanup.cleanupWorkTrash(now+trash.trashRetentionMs));
  assert.equal(h.removed.length,0);assert.ok(h.doc.draft.pendingMediaCleanup.length);
});
test('cron fails closed without the exact secret and does not run cleanup for unauthorized requests', async () => {
  const before=process.env.CRON_SECRET;process.env.CRON_SECRET='local-test-secret';let calls=0;
  try {
    const route=runtime({'@/lib/db/trash-cleanup':{cleanupWorkTrash:async()=>{calls++;return {purged:0};}}})('app/api/cron/trash/route.ts');
    for(const auth of ['', 'Bearer wrong'])assert.equal((await route.GET(new NextRequest('https://example.com/api/cron/trash',{headers:{authorization:auth}}))).status,401);
    assert.equal(calls,0);
    assert.equal((await route.GET(new NextRequest('https://example.com/api/cron/trash',{headers:{authorization:'Bearer local-test-secret'}}))).status,200);
    delete process.env.CRON_SECRET;
    assert.equal((await route.GET(new NextRequest('https://example.com/api/cron/trash'))).status,401);assert.equal(calls,1);
  } finally {if(before===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=before;}
});

test('ordinary CMS writes preserve trash and cleanup queue while explicit restore/purge may clear them', async () => {
  const entry=trash.moveWorkToTrash({items:[work('deleted')]},{items:[]},'deleted',undefined,now).entry;
  const current={revision:3,draft:{items:[work('remaining')],trash:[entry],pendingMediaCleanup:['portfolio-cms-media/works/old.png']},published:{items:[work('remaining')]}};
  let row;
  const query={eq(){return this;},select(){return this;},async maybeSingle(){return {data:row,error:null};}};
  const {writeCMS}=runtime({'@/lib/supabase/admin':{createAdminClient:()=>({from:()=>({update:value=>{row=value;return query;}})})}})('lib/db/cms.ts');
  let saved=await writeCMS('works',current,{items:[work('remaining',{title:'Edited'})]},current.published);
  assert.deepEqual(saved.draft.trash,[entry]);assert.equal(saved.draft.pendingMediaCleanup.length,1);
  assert.equal(saved.published.trash,undefined);
  saved=await writeCMS('works',current,{items:[],trash:[],pendingMediaCleanup:[]},current.published);
  assert.equal(saved.draft.trash.length,0);assert.equal(saved.draft.pendingMediaCleanup.length,0);
});

test('trash endpoint applies CMS auth/CSRF gate before mutations and rejects malformed requests', async () => {
  let denied=true,calls=0;
  const route=runtime({'@/lib/cms-http':{cmsAccess:async()=>denied?new Response(null,{status:403}):null,cmsError:()=>new Response(null,{status:400})},
    '@/lib/db/works':{changeWorkTrash:async()=>{calls++;return {draft:{items:[],trash:[]},published:{items:[]},revision:2};}}})('app/api/admin/works/trash/route.ts');
  const req=body=>new NextRequest('https://example.com/api/admin/works/trash',{method:'POST',headers:{origin:'https://example.com','content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await route.POST(req({action:'move',id:'one',revision:1}))).status,403);assert.equal(calls,0);
  denied=false;
  assert.equal((await route.POST(req({action:'purge',id:'one',revision:1}))).status,400);
  assert.equal((await route.POST(req({action:'move',id:'../path',revision:1}))).status,400);assert.equal(calls,0);
  assert.equal((await route.POST(req({action:'move',id:'one',revision:1}))).status,200);assert.equal(calls,1);
});
