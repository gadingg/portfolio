const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{load}=require('cheerio');
const {componentRuntime}=require('./admin-component-runtime.cjs');
const runtime=componentRuntime(),{WorkEditor}=runtime('components/admin/WorkEditor.tsx');
const item={id:'qa',kind:'webapp',title:'Project',description:'',image:'',imageAlt:'',url:'/work/qa',published:true,demo:false,artwork:'hub',caseStudy:{slug:'qa',problem:'P',solution:'A',impact:'R',blocks:[]}};
test('editor separates basic content, PAR and gallery without losing fields',()=>{
 const $=load(renderToStaticMarkup(React.createElement(WorkEditor,{item,items:[item],disabled:false,errors:{},onChange(){},async onKindChange(){},onBusyChange(){},onOpenVisual(){}})));
 assert.equal($('.editor-tabs button').length,3);
 assert.equal($('[data-work-field=title]').closest('[hidden]').length,0);
 assert.equal($('[data-work-field="caseStudy.problem"]').closest('[hidden]').length,1);
 assert.equal($('.inline-ai-dialog').length,1);
 assert.equal($('a[href*="dashboard/ai"]').length,0);
});
