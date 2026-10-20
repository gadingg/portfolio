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
const { ExploreMoreWork } = load(path.join(root, 'components/public/study-case/ExploreMoreWork.tsx'));
const project = slug => ({ id: slug, slug, title: `Project ${slug}`, subtitle: `Description ${slug}`, cover_image_url: '/assets/work/sample-design-1.svg', cover_image_alt: `Artwork ${slug}` });
const render = props => html(renderToStaticMarkup(React.createElement(ExploreMoreWork, props)));

test('one section features next and first distinct alternative without changing source order', () => {
  const next = project('next'), first = project('first');
  const $ = render({ nextProject: next, related: [next, first, project('other')] });
  assert.equal($('section').length, 1);
  assert.equal($('h2').text(), 'Explore More Work');
  assert.deepEqual($('a').map((_, el) => $(el).attr('href')).get(), ['/work/next', '/work/first']);
  assert.equal($('.case-explore-label').text(), 'UP NEXT');
  assert.equal($('.case-explore-card--next .case-explore-cta').text().trim(), 'Explore next case study');
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

test('single-project and empty navigation do not leave empty or duplicate sections', () => {
  assert.equal(render({ nextProject: null, related: [] })('section').length, 0);
  const nextOnly = render({ nextProject: project('next'), related: [project('next')] });
  assert.equal(nextOnly('a').length, 1);
  const alternativeOnly = render({ nextProject: null, related: [project('alternative')] });
  assert.equal(alternativeOnly('a').length, 1);
  assert.equal(alternativeOnly('.case-explore-label').length, 0);
});
