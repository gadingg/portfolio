const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime}=require('./cms-script-runtime.cjs');
function cards(){
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const node=(tag,cls,text='')=>({tagName:tag.toUpperCase(),className:cls||'',textContent:text,children:[],attrs:{},dataset:{},listeners:{},append(...children){this.children.push(...children);},prepend(child){this.children.unshift(child);},setAttribute(key,value){this.attrs[key]=value;},addEventListener(key,value){this.listeners[key]=value;},get childElementCount(){return this.children.length;}});
 return vm.runInNewContext(source.slice(source.indexOf('  function card('),source.indexOf('  function setupCarousel('))+';card',{node,icon:name=>node('svg',name),image:(url,alt)=>Object.assign(node('img'),{src:url,alt}),safeURL:url=>url?new URL(url,'https://portfolio.test').href:'',location:{origin:'https://portfolio.test'},summary:text=>text,artworkText:{sample:['Sample']},openDialog(){},body:node('div'),modal:{dataset:{}},openVideo(){},showDesign(){}});
}
const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
const item={id:'example',kind:'webapp',title:'Example',description:'A working project.',image:'/assets/sample.svg',imageAlt:'Original artwork',url:'https://example.com',published:true,demo:false,artwork:'sample',caseStudy:{slug:'example'}};
test('project card is one canonical case-study link with no nested controls or duplicate tracking',()=>{
 const root=cards()(item,[item],'h4'),all=descendants(root),link=all.find(node=>node.tagName==='A');
 assert.equal(all.filter(node=>node.tagName==='A').length,1);assert.equal(all.filter(node=>node.tagName==='BUTTON').length,0);
 assert.equal(link.href,'https://portfolio.test/work/example');assert.equal(link.attrs['aria-label'],'View case study: Example');assert.equal(link.dataset.engagement,'work_open');assert.equal(all.filter(node=>node.dataset.engagement).length,1);
 assert.equal(all.find(node=>node.className==='work-destination').tagName,'SPAN');assert.ok(link.children.some(node=>node.className==='work-card-description'));
});
test('a demo without a destination is a single named button with no nested links or buttons',()=>{
 const sample={...item,caseStudy:undefined,url:'',demo:true};const all=descendants(cards()(sample,[sample],'h4'));
 assert.equal(all.filter(node=>node.tagName==='BUTTON').length,1);assert.equal(all.filter(node=>node.tagName==='A').length,0);
 assert.equal(all.find(node=>node.className==='work-card-title').attrs.role,'heading');assert.ok(all.find(node=>node.tagName==='BUTTON').listeners.click);
});
test('artwork lightbox and optional detail link remain separate sibling interactions',()=>{
 const design={...item,kind:'design',caseStudy:undefined,url:'/work/design'};const root=cards()(design,[design],'h4'),all=descendants(root),button=all.find(node=>node.tagName==='BUTTON');
 assert.ok(button.listeners.click);assert.equal(descendants(button).filter(node=>node.tagName==='A').length,0);
 assert.equal(all.find(node=>node.tagName==='A').href,'https://portfolio.test/work/design');assert.equal(all.find(node=>node.className==='work-category').textContent,'Visual Design');
 assert.equal(all.find(node=>node.tagName==='IMG').src,design.image);
});
test('stored CMS layouts receive editorial hero, exact bio, and static design gallery while video remains a carousel',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio'),site=await db.initialSite(),old=load(fs.readFileSync('public/index.html','utf8'));
 site.values.headline='I think. I create.\nI solve.';site.values.aboutLead='Saya suka ikut mikir dari awal.';
 site.values.aboutBody1='Mulai dari mencari ide campaign, menyusun content, membuat visual, sampai melihat workflow yang ribet dan mencari cara supaya bisa dibuat lebih simpel lewat web-app atau AI.';
 site.values.aboutBody2='Buat saya, hasil yang bagus bukan cuma terlihat menarik. Campaign harus punya tujuan, tools harus benar-benar kepakai, dan solusi harus membuat pekerjaan jadi lebih mudah.';
 old('.hero-intro').html('<p>Old name</p><p>Old location</p>');old('#visuals').attr('data-carousel','true').append('<div class="carousel-controls"><button>Pause</button></div>');old('#visuals [data-works-list]').attr('class','works-track');
 site.layout={html:old('body').html(),css:''};const $=load(await db.renderHomepage(site));
 assert.equal($('.hero-metadata').text(),'© 2026 SUB-IDN. Creative Marketing');assert.equal($('#hero-title').text(),'I Think. I Create.I Solve.');
 assert.equal($('.about-copy p').eq(0).text(),'Dari brainstorm, membuat visual, sampai membuat workflow lewat web-app dan AI.');
 assert.equal($('.about-statement').text(),'Good visuals are nice, but good solutions are better.');assert.equal($('.about-copy p').eq(2).text(),'Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik & masalah bisa diselesaikan.');
 assert.equal($('#visuals').attr('data-carousel'),undefined);assert.equal($('#visuals .carousel-controls').length,0);assert.equal($('#visuals .editorial-gallery').length,1);assert.equal($('#videos[data-carousel] .carousel-controls').length,1);
 assert.equal(site.values.aboutLead,'Saya suka ikut mikir dari awal.');
});
