import { WorksCollection } from '@/components/public/WorksCollection';
export const revalidate = 60;
export const metadata = {title:'Portfolio · R. Gading Utama',description:'Web apps, visual design, branding, and video by R. Gading Utama.',alternates:{canonical:'/works'}};
export default function Page(){return <WorksCollection/>;}
