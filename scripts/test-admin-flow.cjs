const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {load: html} = require('cheerio');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (file.endsWith('.css')) return {};
    if (cache.has(file)) return cache.get(file).exports;
    const mod = {exports: {}}; cache.set(file, mod);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }}).outputText;
    new Function('require', 'module', 'exports', source)(name => {
      if (name in mocks) return mocks[name];
      if (name === 'lucide-react') return load(require.resolve(name));
      if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
      const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      return load(['.tsx', '.ts', ''].map(ext => base + ext).find(fs.existsSync));
    }, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

test('admin pages verify the session before reading private draft data and pass one initial snapshot', async () => {
  for (const kind of ['works', 'site']) {
    let allowed = false, reads = 0;
    const doc = {items: [], published: [], draft: {values: {}}, revision: 7};
    const mocks = {
      'next/navigation': {redirect: () => {throw Error('redirect');}},
      '@/lib/auth/session': {verifyAdminSession: async () => allowed},
      '@/lib/db/works': {getWorks: async () => {reads++; return doc;}},
      '@/lib/db/site': {getSiteDocument: async () => {reads++; return doc;}},
      '@/components/admin/WorksManager': {WorksManager: () => null},
      '@/components/admin/SiteManager': {SiteManager: () => null},
    };
    const page = loader(mocks)(`app/admintgadink/dashboard/${kind}/page.tsx`).default;
    await assert.rejects(page({searchParams: Promise.resolve({work: 'selected'})}), /redirect/);
    assert.equal(reads, 0);
    allowed = true;
    const result = await page({searchParams: Promise.resolve({work: 'selected'})});
    assert.equal(reads, 1); assert.equal(result.props.initial, doc);
    if (kind === 'works') assert.equal(result.props.selection.work, 'selected');
  }
});

test('publication controls show one next action only for pending changes, and retain offline recovery', () => {
  const {PublicationBar} = loader()('components/admin/PublicationBar.tsx');
  const render = props => html(renderToStaticMarkup(React.createElement(PublicationBar, {
    dirty: false, unpublished: false, busy: false, operation: null, scope: 'Selected portfolio',
    onSave() {}, onPublish() {}, ...props,
  })));
  let $ = render({});
  assert.equal($('button').length, 0); assert.equal($('.wm-save-scope').length, 0);
  $ = render({dirty: true});
  assert.equal($('button').length, 1); assert.equal($('button').attr('disabled'), undefined);
  $ = render({unpublished: true, offline: true, failed: true});
  assert.equal($('button').length, 2); assert.equal($('button[disabled]').length, 2);
  $ = render({unpublished: true, operation: 'publish', busy: true});
  assert.equal($('button[aria-busy=true]').length, 1);
});

test('route and client skeletons expose one status without a second visible loading message', () => {
  const {AdminSkeleton} = loader()('components/admin/AdminSkeleton.tsx');
  for (const variant of ['form', 'list']) {
    const $ = html(renderToStaticMarkup(React.createElement(AdminSkeleton, {variant})));
    assert.equal($('[role=status]').length, 1);
    assert.equal($('.admin-skeleton-row').length, 4);
    $('.admin-sr-only').remove();
    assert.equal($('body').text().trim(), '');
  }
});
