const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const sources={ulartangga:'D:/vibecodinkk/PATOS APP/Games & Program/Ular Tangga/index.html',spin:'D:/vibecodinkk/PATOS APP/Games & Program/SPIN WHEEL/Index.html'};
const parkingRoot='D:/vibecodinkk/PATOS APP/PARKING SCAN APP/dist';
const employees=['A','B','C'].map((name,i)=>({employee_id:`sample-${i+1}`,employee_name:`Karyawan ${name}`,status:'ACTIVE'}));
const tickets=Array.from({length:6},(_,i)=>({ticket_id:`sample-ticket-${i+1}`,employee_id:employees[i%3].employee_id,employee_name:employees[i%3].employee_name,ticket_date:`2026-11-0${i+1}`,scanned_at:`2026-11-0${i+1}T03:00:00Z`,updated_at:`2026-11-0${i+1}T03:00:00Z`,status:'ACTIVE'}));
function adapter(kind){
  const players=Array.from({length:8},(_,i)=>({order:i+1,name:`Agent ${String.fromCharCode(65+i)}`,closingType:i%2?'L/S':'L/R',closingDetail:`${i%2?'L/S':'L/R'} Listing ${i+1}`,reward:i<4?[25000,50000,0,100000][i]:null,rewardDetail:'',subRewards:null,updatedAt:i<4?'2026-11-07T09:00:00Z':null}));
  const participants=Array.from({length:12},(_,i)=>({id:`illustration-${i+1}`,order:i+1,name:`Peserta ${String.fromCharCode(65+i)}`,status:'Hadir',team:['Oren','Hijau','Coklat','Pink'][i%4],divisi:i%2?'Marketing':'Operasional'}));
  return `<script>(()=>{const players=${JSON.stringify(players)},participants=${JSON.stringify(participants)};let success,fail;const snapshot=()=>({participants,attendanceConfirmed:true});const runner=new Proxy({},{get(_,key){if(key==='withSuccessHandler')return fn=>(success=fn,runner);if(key==='withFailureHandler')return fn=>(fail=fn,runner);return (...args)=>{let response;if(${JSON.stringify(kind)}==='ulartangga'){if(key==='getSavedPlayers'||key==='getRecapHistory')response={players,period:'November 2026',isLocked:false,recapPeriods:[]};else return fail?.({message:'Preview hanya membaca data ilustrasi.'});}else{if(key==='getParticipants')response={success:true,data:snapshot()};else if(key==='saveTeamAssignments'){for(const a of args[0]){const p=participants.find(p=>p.id===a.participantId);if(p)p.team=a.team;}response={success:true,data:snapshot()};}else if(key==='updateWinnerStatus'){const p=participants.find(p=>p.id===args[0]);if(args[1])p.status='Menang';response={success:true,data:{...snapshot(),winner:p}};}else return fail?.({message:'Preview hanya menggunakan data ilustrasi.'});}Promise.resolve().then(()=>success?.(response));};}});window.google={script:{run:runner}};})();</script>`;
}
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),kind=url.pathname.split('/')[1];
  if(kind==='api'){
    res.setHeader('Content-Type','application/json');
    if(req.method!=='GET'){res.writeHead(405);return res.end(JSON.stringify({ok:false,error:{message:'Read-only illustrative preview'}}));}
    let data;
    if(url.pathname==='/api/session')data={access:'public',csrf_token:'preview-only'};
    else if(url.pathname==='/api/employees')data={items:employees};
    else if(url.pathname==='/api/dashboard')data={tickets_today:0,tickets_this_month:6,recent_activity:tickets,server_time:'2026-11-07T03:00:00Z'};
    else if(url.pathname==='/api/tickets')data={items:tickets.filter(t=>!url.searchParams.get('employee_id')||t.employee_id===url.searchParams.get('employee_id')),next_cursor:null};
    else if(url.pathname.endsWith('/image')){res.setHeader('Content-Type','image/svg+xml');return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="650"><rect width="500" height="650" fill="#faf9f5"/><g fill="#252525" font-family="Arial" text-anchor="middle"><text x="250" y="110" font-size="30">KARCIS PARKIR</text><text x="250" y="180" font-size="20">ILUSTRASI</text><text x="250" y="300" font-size="25">06 November 2026</text><text x="250" y="380" font-size="32">Rp 5.000</text><text x="250" y="520" font-size="18">Bukan bukti transaksi</text></g></svg>');}
    else {res.writeHead(404);return res.end(JSON.stringify({ok:false,error:{message:'Preview endpoint unavailable'}}));}
    return res.end(JSON.stringify({ok:true,data,request_id:'illustration'}));
  }
  if(!kind||kind==='parking'||kind==='assets'||['recap','history','employees','scan'].includes(kind)){
    const relative=kind==='assets'?url.pathname.slice(1):'index.html',file=path.resolve(parkingRoot,relative);
    if(!file.startsWith(path.resolve(parkingRoot)+path.sep)){res.writeHead(403);return res.end();}
    const type=relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.woff2')?'font/woff2':'text/html';res.setHeader('Content-Type',type);
    if(type==='text/html')return res.end(fs.readFileSync(file,'utf8').replace('</body>','<aside style="position:fixed;top:0;right:0;z-index:99999;background:#fff;color:#263238;font:11px Arial">Data ilustrasi · preview lokal</aside></body>'));
    return res.end(fs.readFileSync(file));
  }
  if(!sources[kind]){res.writeHead(404);return res.end('Not found');}
  const html=fs.readFileSync(sources[kind],'utf8');
  res.setHeader('Content-Type','text/html;charset=utf-8');
  res.end(html.replace('<head>','<head>'+adapter(kind)).replace('</body>','<aside style="position:fixed;bottom:0;right:0;z-index:99999;padding:3px 8px;background:#fff;color:#263238;font:11px Arial">Data ilustrasi · preview lokal</aside></body>'));
});
server.listen(3031,'127.0.0.1',()=>console.log('Read-only source previews: http://127.0.0.1:3031/ulartangga and /spin. No production writes.'));
