import { VisualEditor } from '@/components/admin/VisualEditor';
export default async function Page({params}:{params:Promise<{target:string}>}){
  const {target}=await params;
  return <VisualEditor key={target} target={target}/>;
}
