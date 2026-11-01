import type { z } from 'zod';
import type { CaseStudySchema } from './content-blocks';
import type {WorkItem} from './works';

export type CaseMotionConfig = NonNullable<z.infer<typeof CaseStudySchema>['motion']>;
const titles: Record<string,string> = {
  listinghub:'Two apps. One clearer workflow.', metaads:'From reporting to the next action.',
  mbg:'From daily activity to visible progress.', dailyapp:'One workspace. Less repeat work.',
  mydaily:'A clearer view of everyday life.', reqvideo:'From request to a confirmed schedule.',
};
const descriptions:Record<string,string>={listinghub:'Search, filter, share, and manage personal listings.',metaads:'Read the report, compare the signals, and plan the next action.',mbg:'Record activities, follow the rules, and review progress.',dailyapp:'Tasks, prompts, watermarks, and resources in one workspace.',mydaily:'Daily tasks, spending, habits, and progress.',reqvideo:'Submit a listing, review the queue, and confirm the schedule.'};
export function caseMotion(study:{slug:string;motion?:CaseMotionConfig}):CaseMotionConfig|null {
  if(study.motion)return study.motion.enabled&&study.motion.video?study.motion:null;
  if(!titles[study.slug])return null;
  const base=`/assets/motion/${study.slug}`;
  return {enabled:true,title:titles[study.slug],video:`${base}.mp4`,mobileVideo:`${base}-mobile.mp4`,poster:`${base}.webp`,mobilePoster:`${base}-mobile.webp`,description:descriptions[study.slug]};
}
export function withCaseMotion(item:WorkItem):WorkItem{
  if(!item.caseStudy||item.caseStudy.motion)return item;
  const motion=caseMotion(item.caseStudy);
  return motion?{...item,caseStudy:{...item.caseStudy,motion}}:item;
}
