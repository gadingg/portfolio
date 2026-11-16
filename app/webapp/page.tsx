import { WorksCollection } from '@/components/public/WorksCollection';
export const revalidate = 60;
export const metadata = {title:'Website / Apps · R. Gading Utama',description:'Website dan aplikasi oleh R. Gading Utama.',alternates:{canonical:'/webapp'}};
export default function Page(){return <WorksCollection kind="webapp" />;}
