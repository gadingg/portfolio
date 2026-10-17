import { z } from 'zod';
export const engagementKinds = ['work_open','design_open','video_open','contact_click','app_click'] as const;
export const engagementLabels: Record<typeof engagementKinds[number],string> = {
  work_open:'Buka karya', design_open:'Perbesar desain', video_open:'Buka video',
  contact_click:'Klik kontak', app_click:'Buka aplikasi',
};
export const EngagementEventSchema=z.object({
  eventId:z.string().uuid(), type:z.enum(engagementKinds),
  workId:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional(),
}).strict().superRefine((event,ctx)=>{
  if(event.type!=='contact_click'&&!event.workId)ctx.addIssue({code:'custom',message:'Karya wajib dipilih.'});
  if(event.type==='contact_click'&&event.workId)ctx.addIssue({code:'custom',message:'Kontak tidak terkait karya.'});
});
export const EngagementSummarySchema=z.object({
  total:z.number().int().nonnegative(),
  daily:z.array(z.object({date:z.string(),clicks:z.number().int().nonnegative()})),
  types:z.record(z.number().int().nonnegative()),
  popular:z.array(z.object({id:z.string(),clicks:z.number().int().nonnegative()})),
  firstEventAt:z.string().nullable(),
});
export type EngagementSummary=z.infer<typeof EngagementSummarySchema>;
