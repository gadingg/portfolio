import { WorksCollection } from '@/components/public/WorksCollection';
export const revalidate = 60;
export const metadata = {title:'Branding & Video · R. Gading Utama',description:'Branding, campaign, dan video oleh R. Gading Utama.',alternates:{canonical:'/video'}};
export default function Page(){return <WorksCollection kind="video" />;}
