const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { load: html } = require('cheerio');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require', 'module', 'exports', source)(name => {
    if (name === 'lucide-react') return load(require.resolve(name));
    if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
    const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
    return load(['.tsx', '.ts'].map(ext => base + ext).find(fs.existsSync) || base);
  }, module, module.exports);
  return module.exports;
}
const { NextProjectNav } = load(path.join(root, 'components/public/study-case/NextProjectNav.tsx'));
const Loading = load(path.join(root,'app/work/[slug]/loading.tsx')).default;
const LoadError = load(path.join(root,'app/work/[slug]/error.tsx')).default;
const project = slug => ({ id: slug, slug, title: `Project ${slug}`, subtitle: `Description ${slug}`, cover_image_url: '/assets/work/sample-design-1.svg', cover_image_alt: `Artwork ${slug}` });
const render = props => html(renderToStaticMarkup(React.createElement(NextProjectNav, props)));

test('one Selected Works-style card contains only the next project and one CTA', () => {
  const next = project('next'), first = project('first');
  const $ = render({ nextProject: next, related: [next, first, project('other')] });
  assert.equal($('section').length, 1);
  assert.equal($('h2').text(), 'Next Project');
  assert.deepEqual($('a').map((_, el) => $(el).attr('href')).get(), ['/work/next']);
  assert.equal($('.case-explore-label,.case-explore-grid').length,0);
  assert.equal($('.work-card.work-card-webapp>.work-card-link').length,1);
  assert.equal($('.work-destination').text().trim(), 'Next Case Study');
  assert.deepEqual($('.work-card-link').children().map((_,el)=>$(el).attr('class')).get(),['work-media','work-card-title','work-card-description','work-card-meta']);
});

test('each entire preview is one named link with image, original copy and no nested actions', () => {
  const $ = render({ nextProject: project('next'), related: [project('alternative')] });
  $('a').each((_, el) => {
    const link = $(el);
    assert.equal(link.find('a,button,input').length, 0);
    assert.equal(link.find('img').length, 1);
    assert.equal(link.find('h3').length, 1);
    assert.ok(link.find('p').text().startsWith('Description '));
    for (const id of link.attr('aria-labelledby').split(' ')) assert.equal($(`[id="${id}"]`).length, 1);
    assert.equal($(`[id="${link.attr('aria-describedby')}"]`).length, 1);
  });
});

test('missing next project renders no section or alternative suggestions', () => {
  assert.equal(render({ nextProject: null, related: [] })('section').length, 0);
  const nextOnly = render({ nextProject: project('next'), related: [project('next')] });
  assert.equal(nextOnly('a').length, 1);
  const alternativeOnly = render({ nextProject: null, related: [project('alternative')] });
  assert.equal(alternativeOnly('a').length, 0);
  assert.equal(alternativeOnly('.case-explore-label').length, 0);
});

test('next project follows the supplied order and the last wraps to the first',()=>{
 const {runtime}=require('./cms-script-runtime.cjs');
 const {getProjectNavigation}=runtime()('lib/db/public-projects.ts');
 const projects=['first','second','third'].map(slug=>({...project(slug),category:'Website / Apps'}));
 projects.forEach((current,index)=>{
  const {nextProject}=getProjectNavigation(projects,current.slug,current.category);
  assert.equal(nextProject.slug,projects[(index+1)%projects.length].slug);
  const $=render({nextProject});assert.equal($('a').attr('href'),'/work/'+nextProject.slug);
  assert.equal($('h3').text(),nextProject.title);assert.equal($('.work-card-description').text(),nextProject.subtitle);
 });
});

test('loading renders a named busy region, visible status and decorative skeleton while keeping navigation',()=>{
 const $=html(renderToStaticMarkup(React.createElement(Loading)));
 assert.equal($('main[aria-busy="true"]').length,1);assert.ok($('[role="status"]').text().includes('Memuat'));
 assert.equal($('.case-skeleton-cover').length,1);assert.equal($('.case-skeleton-columns .case-skeleton').length,3);
 assert.ok($('.wordmark').attr('href'));assert.equal($('.case-skeleton').closest('[aria-hidden="true"]').length,1);
});

test('failed loads offer retry and a working return link rather than a perpetual skeleton',()=>{
 const $=html(renderToStaticMarkup(React.createElement(LoadError,{reset(){},error:new Error('private backend detail')})));
 assert.equal($('.case-load-error button').text(),'Coba lagi');assert.equal($('.case-load-error a').attr('href'),'/#work');
 assert.equal($('[role="alert"]').length,1);assert.equal($('.case-skeleton').length,0);
 assert.ok(!$.html().includes('private backend detail'));
});
