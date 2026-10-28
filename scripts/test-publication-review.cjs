const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');
const {summarizePortfolioChanges,portfolioPublicationMessage,sitePublicationSummary}=runtime()('lib/publication-review.ts');
const item=(id,extra={})=>({id,title:id,kind:'webapp',description:'',image:'',imageAlt:'',url:'',published:true,demo:false,artwork:'hub',...extra});
test('publication review includes changes across categories, removal and reordered items',()=>{
 const published=[item('one'),item('two',{kind:'video'}),item('removed')];
 const draft=[item('two',{kind:'video',title:'Edited video'}),item('one'),item('new')];
 const result=summarizePortfolioChanges(draft,published);
 assert.deepEqual(result.changed,['Edited video','removed','new']);assert.equal(result.orderChanged,true);
 const message=portfolioPublicationMessage(draft,published);
 assert.match(message,/3 portfolio/);assert.match(message,/Edited video/);assert.match(message,/urutan portfolio/);
 assert.deepEqual(summarizePortfolioChanges([published[1],published[0],published[2]],published),{changed:[],orderChanged:true});
});
test('website and CV changes are reviewed separately before publishing either editor',()=>{
 const original={values:{title:'Original'},layout:{html:'Old',css:''},cv:{name:'Original'}};
 assert.deepEqual(sitePublicationSummary({...original,cv:{name:'Edited'}},original),['CV']);
 assert.deepEqual(sitePublicationSummary({...original,values:{title:'Edited'},cv:{name:'Edited'}},original),['Website','CV']);
});
