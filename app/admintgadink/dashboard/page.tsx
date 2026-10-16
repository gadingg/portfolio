import Link from 'next/link';
import { getWorksDocument } from '@/lib/db/works';
import { workKinds,workLabels } from '@/lib/works';
import '@/components/admin/works-manager.css';
export const dynamic='force-dynamic';
export default async function Page(){
  const {draft,published}=await getWorksDocument();
  return <div className="works-manager cms-manager"><h1>Portfolio CMS</h1><div className="cms-editor-fields">{workKinds.map(kind=><div key={kind} className="cms-work-row"><div className="wm-summary"><h2>{workLabels[kind]}</h2><p>{published.items.filter(item=>item.kind===kind&&item.published).length} tampil · {draft.items.filter(item=>item.kind===kind).length} dalam editor</p></div><Link href="/admintgadink/dashboard/works" className="wm-button">Kelola</Link></div>)}<div className="cms-work-row"><div className="wm-summary"><h2>Website & CV</h2><p>Hero, About, kontak, dan CV</p></div><Link href="/admintgadink/dashboard/site" className="wm-button">Edit website</Link></div></div></div>;
}
