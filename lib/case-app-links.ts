export type CaseAppLink={label:string;url:string};
export function caseAppLinks(study:{slug?:string;appUrl?:string;appLinks?:CaseAppLink[]}):CaseAppLink[]{
  if(study.appLinks)return study.appLinks;
  if(['listinghub','internal-listing-hub'].includes(study.slug||'')&&study.appUrl==='https://listinghub-patos.vercel.app/all')return [{label:'Open All Database',url:study.appUrl},{label:'Open Personal Listing',url:'https://listinghub-patos.vercel.app/gading'}];
  return study.appUrl?[{label:'Open app',url:study.appUrl}]:[];
}
