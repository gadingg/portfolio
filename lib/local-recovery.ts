export type LocalVersion<T>={savedAt:number;revision:number;value:T};
export function readLocalVersion<T>(raw:string|null,validate:(value:unknown)=>T,now=Date.now()):LocalVersion<T>|null{
  if(!raw||raw.length>2500000)return null;
  try{const data=JSON.parse(raw);if(!Number.isFinite(data.savedAt)||!Number.isInteger(data.revision)||data.savedAt>now+60000||now-data.savedAt>7*86400000)return null;return {...data,value:validate(data.value)};}catch{return null;}
}
