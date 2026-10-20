const assert=require('node:assert/strict'),{load}=require('cheerio');
const redirects=require('../lib/case-slugs.json');
const base=process.env.CASE_AUDIT_URL||'http://localhost:3008';
(async()=>{
 const measurements=[];
 for(const [old,slug]of Object.entries(redirects)){
  const response=await fetch(`${base}/work/${old}`,{redirect:'manual',signal:AbortSignal.timeout(12000)});
  assert.equal(response.status,308,old);assert.equal(new URL(response.headers.get('location'),base).pathname,`/work/${slug}`);
 }
 const slugs=[...new Set(Object.values(redirects))];
 for(let round=0;round<2;round++)for(const slug of slugs){
  const started=performance.now(),response=await fetch(`${base}/work/${slug}`,{signal:AbortSignal.timeout(14000)});
  const headerMs=Math.round(performance.now()-started),body=await response.text(),$=load(body);
  assert.equal(response.status,200,slug);assert.ok($('h1').text().trim(),slug);
  assert.ok($('.study-case-blocks').text().trim().length>100,slug);
  assert.equal($('.case-next-project').length,1,slug);
  assert.equal($('.case-next-project .work-card-link').length,1,slug);
  assert.equal($('.case-next-project .works-heading h2').text(),'Next Project');
  assert.equal($('.case-next-project .work-destination').text().trim(),'Next Case Study');
  assert.ok($('link[rel="canonical"]').attr('href').endsWith('/work/'+slug),slug);
  const next=slugs[(slugs.indexOf(slug)+1)%slugs.length];
  assert.equal($('.case-next-project .work-card-link').attr('href'),`/work/${next}`);
  assert.equal($('.case-explore').length,0);
  measurements.push({slug,round,headerMs,totalMs:Math.round(performance.now()-started),bytes:body.length});
 }
 const data=await(await fetch(base+'/api/works')).json();
 assert.deepEqual(data.items.filter(item=>item.caseStudy).map(item=>item.caseStudy.slug),slugs);
 const sitemap=await(await fetch(base+'/sitemap.xml')).text();slugs.forEach(slug=>assert.ok(sitemap.includes('/work/'+slug)));
 for(const old of Object.keys(redirects))assert.ok(!sitemap.includes('/work/'+old));
 const missing=await fetch(base+'/work/no-such-case',{signal:AbortSignal.timeout(12000)});
 assert.ok([200,404].includes(missing.status));
 const missingHTML=load(await missing.text());
 assert.ok(missingHTML('meta[name="robots"]').attr('content')?.includes('noindex'));
 assert.ok(missingHTML('body').text().includes('404'));
 const flight=await fetch(base+'/work/reqvideo?_rsc=case-audit',{headers:{RSC:'1','Next-Url':'/work/dailyapp'},signal:AbortSignal.timeout(12000)});
 assert.equal(flight.status,200);assert.ok((await flight.text()).includes('Req Video'));
 console.log(JSON.stringify({base,redirects:Object.keys(redirects).length,canonicalPages:slugs.length,rounds:2,missing:{http:missing.status,noindex:true,notFound:true},rsc:200,measurements},null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
