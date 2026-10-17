import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { getSiteDocument, renderHomepage } from '@/lib/db/site';
import { getWorksDocument } from '@/lib/db/works';
import { writeCMS, CMSConflict } from '@/lib/db/cms';
import { cleanVisualLayout } from '@/lib/visual-layout';
import { SiteSchema, siteFields } from '@/lib/site';
import { WorksDraftSchema, WorksSchema } from '@/lib/works';
import { z } from 'zod';
export const dynamic='force-dynamic';
const targetSchema=z.string().regex(/^(home|[a-zA-Z0-9_-]{1,100})$/);
export async function GET(request:NextRequest){
  const denied=await cmsAccess();if(denied)return denied;
  try{
    const target=targetSchema.parse(request.nextUrl.searchParams.get('target'));
    if(target==='home'){
      const [doc,works]=await Promise.all([getSiteDocument(),getWorksDocument()]);
      const rendered=await renderHomepage(doc.draft,works.draft.items.filter(item=>item.published&&item.caseStudy).flatMap(item=>[item.caseStudy!.slug,...(item.aliases||[])]));
      const layout=doc.draft.layout?cleanVisualLayout({html:load(rendered)('body').html()||'',css:doc.draft.layout.css}):undefined;
      return NextResponse.json({revision:doc.revision,layout,seedHtml:layout?undefined:rendered,title:'Homepage',seedUrl:'/api/admin/preview/site',previewUrl:'/api/admin/preview/site'}, {headers:{'Cache-Control':'no-store'}});
    }
    const doc=await getWorksDocument(),item=doc.draft.items.find(item=>item.id===target);
    if(!item?.caseStudy)return NextResponse.json({error:'Studi kasus tidak ditemukan.'},{status:404});
    return NextResponse.json({revision:doc.revision,layout:item.caseStudy.layout?cleanVisualLayout(item.caseStudy.layout):undefined,title:item.title,seedUrl:`/admintgadink/preview/${target}`,previewUrl:`/admintgadink/preview/${target}`},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return cmsError(error);}
}
export async function PUT(request:NextRequest){
  const denied=await cmsAccess(request);if(denied)return denied;
  try{
    const body=await request.json();
    const {target,revision,action}=z.object({target:targetSchema,revision:z.number().int().min(0),action:z.enum(['save','publish'])}).parse(body);
    const layout=cleanVisualLayout(body.layout);
    if(!layout.html.trim())return NextResponse.json({error:'Halaman kosong. Tambahkan section sebelum menyimpan.'},{status:400});
    if(target==='home'){
      const doc=await getSiteDocument();if(doc.revision!==revision)throw new CMSConflict();
      const values={...doc.draft.values},$=load(layout.html);
      for(const field of siteFields){
        const el=$(field.selector).first();if(!el.length||field.attribute==='content')continue;
        if(field.attribute)values[field.key]=el.attr(field.attribute)||'';
        else {const copy=el.clone();copy.find('br').replaceWith('\n');values[field.key]=copy.text().trim();if(field.key==='footerName')values[field.key]=values[field.key].replace(/^©\s*\d{4}\s*/,'');}
      }
      const draft=SiteSchema.parse({...doc.draft,values,layout});
      const saved=await writeCMS('site',doc,draft,action==='publish'?draft:doc.published);
      return NextResponse.json({revision:saved.revision,layout:saved.draft.layout});
    }
    const doc=await getWorksDocument();if(doc.revision!==revision)throw new CMSConflict();
    const current=doc.draft.items.find(item=>item.id===target);if(!current?.caseStudy)return NextResponse.json({error:'Studi kasus tidak ditemukan.'},{status:404});
    const $=load(layout.html),title=$('h1').first().text().trim(),description=$('.case-intro p').first().text().trim();
    const items=doc.draft.items.map(item=>item.id===target?{...item,...(title?{title}:{}),...(description?{description}:{}),caseStudy:{...item.caseStudy!,layout}}:item);
    const draft=WorksDraftSchema.parse({items});
    let published=doc.published;
    if(action==='publish'){
      const item=draft.items.find(item=>item.id===target)!;
      const previous=doc.published.items.find(value=>value.id===target);
      if(previous?.caseStudy&&previous.caseStudy.slug!==item.caseStudy!.slug)item.aliases=[...new Set([...(item.aliases||[]),previous.caseStudy.slug])];
      published=WorksSchema.parse({items:previous?doc.published.items.map(value=>value.id===target?item:value):[...doc.published.items,item]});
    }
    const saved=await writeCMS('works',doc,draft,published);
    const updated=saved.draft.items.find(item=>item.id===target)!;
    return NextResponse.json({revision:saved.revision,layout:updated.caseStudy!.layout,title:updated.title});
  }catch(error){return cmsError(error);}
}
