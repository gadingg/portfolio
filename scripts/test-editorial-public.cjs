const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime}=require('./cms-script-runtime.cjs');
function cards(){
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const node=(tag,cls,text='')=>({tagName:tag.toUpperCase(),className:cls||'',textContent:text,children:[],attrs:{},dataset:{},listeners:{},append(...children){this.children.push(...children);},prepend(child){this.children.unshift(child);},setAttribute(key,value){this.attrs[key]=value;},addEventListener(key,value){this.listeners[key]=value;},get childElementCount(){return this.children.length;}});
 return vm.runInNewContext(source.slice(source.indexOf('  function card('),source.indexOf('  function setupEditorialGallery('))+';card',{node,icon:name=>node('svg',name),image:(url,alt)=>Object.assign(node('img'),{src:url,alt}),safeURL:url=>url?new URL(url,'https://portfolio.test').href:'',location:{origin:'https://portfolio.test'},summary:text=>text,artworkText:{sample:['Sample']},openDialog(){},body:node('div'),modal:{dataset:{}},openVideo(){},showDesign(){}});
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
 assert.equal(all.filter(node=>node.className==='work-enlarge').length,0);
 const demo=descendants(cards()({...design,demo:true},[design],'h4'));
 assert.equal(demo.filter(node=>node.className==='sample-label').length,0);
});
test('stored CMS layouts receive editorial hero, exact bio, and matching design/video carousel controls',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio'),site=await db.initialSite(),old=load(fs.readFileSync('public/index.html','utf8'));
 site.values.headline='I think. I create.\nI solve.';site.values.aboutLead='Saya suka ikut mikir dari awal.';
 site.values.aboutBody1='Mulai dari mencari ide campaign, menyusun content, membuat visual, sampai melihat workflow yang ribet dan mencari cara supaya bisa dibuat lebih simpel lewat web-app atau AI.';
 site.values.aboutBody2='Buat saya, hasil yang bagus bukan cuma terlihat menarik. Campaign harus punya tujuan, tools harus benar-benar kepakai, dan solusi harus membuat pekerjaan jadi lebih mudah.';
 old('.hero-intro').html('<p>Old name</p><p>Old location</p>');old('#visuals').attr('data-carousel','true').append('<div class="carousel-controls"><button>Pause</button></div>');old('#visuals [data-works-list]').attr('class','works-track');
 site.layout={html:old('body').html(),css:''};const $=load(await db.renderHomepage(site));
 assert.equal($('.hero-metadata').text(),'Creative Marketing & Digital Solutions');assert.equal($('#hero-title').text(),'I Think. I Create.I Solve.');
 assert.equal($('.about-copy>p').length,1);
 assert.equal($('.about-statement').text(),'Good visuals catch eyes. Great ideas make an impact.');assert.equal($('.about-copy>p').text(),'Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik dan pekerjaan jadi lebih simpel.');
 assert.equal($('#visuals').attr('data-carousel'),'true');assert.equal($('#visuals .carousel-controls').length,1);assert.equal($('#visuals .editorial-gallery.works-track').length,1);assert.equal($('#videos[data-carousel] .carousel-controls').length,1);
 assert.equal($('#visuals .gallery-hint').length,0);
 assert.equal(site.values.aboutLead,'Saya suka ikut mikir dari awal.');
});

test('design showcase uses video-style caption without play action and keeps detail link outside lightbox button',()=>{
 const design={...item,kind:'design',caseStudy:undefined,url:'/work/design'};
 const root=cards()(design,[design],'h4',true),all=descendants(root);
 const button=all.find(node=>node.tagName==='BUTTON');
 assert.ok(all.some(node=>node.className==='video-bottom design-showcase-caption'));
 assert.equal(all.filter(node=>node.className==='video-play'||node.textContent==='Watch video').length,0);
 assert.equal(descendants(button).filter(node=>node.tagName==='A').length,0);
 assert.ok(all.find(node=>node.className==='design-title-link'));
 assert.ok(button.listeners.click);
});

test('legacy five-capability layouts receive four exact title-only cards without deleting stored copy',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{siteFields,capabilityTitles}=runtime()('lib/site.ts'),{load}=require('cheerio');
 const site=await db.initialSite(),old=load(fs.readFileSync('public/index.html','utf8'));
 const original=Array.from({length:5},(_,i)=>[`Old capability ${i}`,`Stored paragraph ${i}`]);
 delete site.values.capabilityLayoutVersion;
 original.forEach(([title,copy],i)=>{site.values[`capabilityTitle${i}`]=title;site.values[`capabilityBody${i}`]=copy;});
 old('.capability-list').removeClass('capability-bento-v2');
 old('.capability-list').empty().append(original.map(([title,copy])=>`<details><summary>${title}<svg class="icon"></svg></summary><p>${copy}</p></details>`).join(''));
 old('#work>.section-heading').append('<p>Old Selected Works helper</p>');
 site.values.capabilityTitle1='Desain dengan arah yang jelas';site.values.capabilityBody1='Copy yang disimpan melalui CMS.';
 site.values.worksIntro='Keep this stored value intact';
 site.layout={html:old('body').html(),css:''};
 const rendered=await db.renderHomepage(site),$=load(rendered);
 assert.equal($('.capability-list details').length,0);assert.equal($('.capability-card').length,4);
 assert.equal($('.capability-visual').length,4);assert.equal($('.capability-card p,.capability-card summary,.capability-card img').length,0);
 assert.deepEqual($('.capability-card h4').map((_,el)=>$(el).text()).get(),Array.from(capabilityTitles));
 assert.equal(site.values.capabilityTitle1,'Desain dengan arah yang jelas');assert.equal(site.values.capabilityBody1,'Copy yang disimpan melalui CMS.');
 assert.equal(site.values.capabilityBody4,'Stored paragraph 4');
 assert.equal($('#work>.section-heading p').length,0);assert.equal($('.works-heading>.works-view-all').length,3);
 assert.equal(site.values.worksIntro,'Keep this stored value intact');assert.equal(siteFields.some(field=>field.key==='worksIntro'),false);
 $('.capability-visual').first().addClass('custom-visual');
 site.values.capabilityLayoutVersion='2';site.values.capabilityTitle1='Editable title after migration';
 site.layout={html:$('body').html(),css:''};const again=load(await db.renderHomepage(site));
 assert.equal(again('.capability-card').length,4);assert.equal(again('.capability-visual').length,4);
 assert.equal(again('#visuals .carousel-controls').length,1);
 assert.equal(again('.capability-visual').first().hasClass('custom-visual'),true);
 assert.equal(again('.capability-card h4').eq(1).text(),'Editable title after migration');
 assert.equal(siteFields.filter(field=>field.key.startsWith('capabilityTitle')).length,4);
 assert.equal(siteFields.some(field=>field.key.startsWith('capabilityBody')),false);
});

test('homepage and stored layouts place Works before About and preserve editable quote and single body',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio');
 const site=await db.initialSite(),old=load(fs.readFileSync('public/index.html','utf8'));
 assert.equal(site.values.aboutBody1,'Good visuals catch eyes. Great ideas make an impact.');
 assert.ok(site.values.aboutBody2.startsWith('Buat saya,'));
 old('#work').insertAfter(old('#home'));
 old('.about-quote').replaceWith(old('.about-statement').clone());
 site.values.aboutBody1='An editable statement from the CMS.';
 site.layout={html:old('body').html(),css:''};
 const $=load(await db.renderHomepage(site));
 assert.deepEqual($('main>section').slice(0,3).map((_,el)=>$(el).attr('id')).get(),['home','work','about']);
 assert.equal($('.about-copy>blockquote.about-quote').length,1);
 assert.equal($('.about-quote .about-statement').text(),site.values.aboutBody1);
 assert.equal($('.about-copy>p').length,1);
 assert.equal($('.about-copy>p').last().text(),site.values.aboutBody2);
 site.layout={html:$('body').html(),css:''};const again=load(await db.renderHomepage(site));
 assert.equal(again('.about-quote').length,1);assert.equal(again('.about-quote blockquote').length,0);
 assert.deepEqual(again('main>section').slice(0,3).map((_,el)=>again(el).attr('id')).get(),['home','work','about']);
});

test('previous published copy receives new defaults without overwriting custom CMS text or stored data',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio'),site=await db.initialSite();
 site.values.heroMetadata='© 2026 SUB-IDN. Creative Marketing';
 site.values.intro='Saya menggabungkan creative marketing, design, dan technology untuk mengubah ide atau masalah bisnis menjadi campaign, visual, dan web-app yang benar-benar bisa dipakai.';
 const legacy=load(fs.readFileSync('public/index.html','utf8'));
 legacy('.about-copy').prepend('<p>Dari brainstorm, membuat visual, sampai membuat workflow lewat web-app dan AI.</p>');
 site.layout={html:legacy('body').html(),css:''};
 const $=load(await db.renderHomepage(site));
 assert.equal($('.hero-bottom>p').text(),'Saya suka mengubah ide jadi sesuatu yang benar-benar kepakai, dari visual sampai solusi digital.');
 assert.equal($('.hero-metadata').text(),'Creative Marketing & Digital Solutions');
 assert.equal($('.about-copy>p').length,1);assert.doesNotMatch($('.about-copy').text(),/Dari brainstorm/);
 assert.equal($('script[src="/assets/js/capabilities-motion.js"]').length,1);
 assert.match($('.site-footer').text(),/©/);assert.doesNotMatch($('#home').text(),/©/);
 assert.equal(site.values.heroMetadata,'© 2026 SUB-IDN. Creative Marketing');
 site.values.intro='Saya suka mengembangkan ide jadi sesuatu yang benar-benar kepakai. Mulai dari campaign, visual, sampai web-app yang bikin workflow\u00a0lebih simpel.';
 assert.equal(load(await db.renderHomepage(site))('.hero-bottom>p').text(),'Saya suka mengubah ide jadi sesuatu yang benar-benar kepakai, dari visual sampai solusi digital.');
 site.values.intro='Custom introduction';site.values.heroMetadata='Custom metadata';site.values.aboutBody2='Custom explanation';
 const custom=load(await db.renderHomepage(site));
 assert.equal(custom('.hero-bottom>p').text(),'Custom introduction');assert.equal(custom('.hero-metadata').text(),'Custom metadata');assert.equal(custom('.about-copy>p').text(),'Custom explanation');
});
