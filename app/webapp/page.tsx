import { WorksCollection } from '@/components/public/WorksCollection';
export const dynamic = 'force-dynamic';
export const metadata = {title:'Website / Apps · R. Gading Utama',description:'Website dan aplikasi oleh R. Gading Utama.',alternates:{canonical:'/webapp'}};
export default function Page(){return <WorksCollection kind="webapp" />;}
