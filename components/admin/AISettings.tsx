'use client';
import { useEffect,useState } from 'react';
import { useConfirm } from './ConfirmDialog';
import './works-manager.css';
import './ai-study.css';

type Status={configured:boolean;model:string;updatedAt:string};
export function AISettings(){
  const [status,setStatus]=useState<Status|null>(null),[key,setKey]=useState(''),[model,setModel]=useState('');
  const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
  const {ask,confirmation}=useConfirm();
  async function load(){setLoading(true);setError('');try{const res=await fetch('/api/admin/ai/settings',{cache:'no-store'}),data=await res.json();if(!res.ok)throw Error(data.error);setStatus(data);setModel(data.model);}catch(e){setError(e instanceof Error?e.message:'Pengaturan belum bisa dimuat.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  async function act(action:'save'|'test'|'delete'){
    if(busy)return;
    if(action==='delete'&&!await ask('Hapus Gemini API key yang tersimpan? Fitur generate berhenti sampai key baru ditambahkan.','Hapus key'))return;
    setBusy(true);setError('');setMessage('');
    try{
      const res=await fetch('/api/admin/ai/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,model,...(key.trim()&&action!=='delete'?{apiKey:key.trim()}:{})}),signal:AbortSignal.timeout(28000)}),data=await res.json();
      if(!res.ok)throw Error(data.error);
      if(action==='test')setMessage(`${data.message}${key?' Key baru belum disimpan.':''}`);
      else{setStatus(data);setKey('');setMessage(action==='delete'?'API key sudah dihapus.':'Pengaturan AI tersimpan.');}
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'Permintaan belum selesai. Coba lagi.');}finally{setBusy(false);}
  }
  return <div className="works-manager cms-manager ai-workspace">
    {confirmation}
    <header className="wm-heading"><div><h1>Pengaturan AI</h1><p>Hubungkan Gemini untuk menulis draft studi kasus.</p></div><a className="wm-button" href="/admintgadink/dashboard/ai">Buka AI Study Case</a></header>
    {error&&<p className="cms-error" role="alert">{error}</p>}{message&&<p className="ai-notice" role="status">{message}</p>}
    {loading?<p role="status">Memuat pengaturan…</p>:!status?<button type="button" className="wm-button" onClick={load}>Coba lagi</button>:<section className="ai-settings-panel" aria-labelledby="gemini-settings-title">
      <h2 id="gemini-settings-title">Gemini API</h2><p className="ai-connection" role="status">{status.configured?'API key tersimpan':'Belum terhubung'}</p>
      <fieldset disabled={busy} className="ai-fields">
        <label>{status.configured?'Ganti API key':'Gemini API key'}<input type="password" autoComplete="new-password" spellCheck={false} value={key} onChange={event=>setKey(event.target.value)} placeholder={status.configured?'Kosongkan untuk memakai key tersimpan':'Paste API key di sini'}/></label>
        <p className="wm-editor-note">Key disimpan terenkripsi di server dan tidak ditampilkan kembali. Key ini dipakai khusus fitur AI portfolio.</p>
        <label>ID model<input value={model} maxLength={80} spellCheck={false} onChange={event=>setModel(event.target.value)} placeholder="gemini-3.8-flash"/></label>
        <p className="wm-editor-note">Gunakan ID model teks yang tersedia di akun Gemini Anda. Tes koneksi mengirim satu permintaan singkat.</p>
        <div className="ai-actions"><button type="button" className="wm-button wm-primary" disabled={!model||(!key&&!status.configured)} onClick={()=>act('save')}>{busy?'Memproses…':'Simpan pengaturan'}</button><button type="button" className="wm-button" disabled={!model||(!key&&!status.configured)} onClick={()=>act('test')}>Tes koneksi</button>{status.configured&&<button type="button" className="wm-button" onClick={()=>act('delete')}>Hapus key</button>}</div>
      </fieldset>
      <p className="wm-editor-note">Catatan project dikirim ke Gemini saat Anda klik generate. Penggunaan mengikuti kuota API Anda.</p>
      <a className="ai-inline-link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Kelola key di Google AI Studio</a>
    </section>}
  </div>;
}
