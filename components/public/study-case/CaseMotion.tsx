'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {CaseMotionConfig} from '@/lib/case-motion';

function MotionPlayer({motion}:{motion:CaseMotionConfig}){
  const section=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
  const visible=useRef(false),reduced=useRef(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const player=video.current,root=section.current;if(!player||!root)return;
    let disposed=false,loaded=false;
    const preference=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width: 640px)');
    const saveData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true;
    reduced.current=preference.matches||saveData;
    function source(){if(loaded)return;loaded=true;player!.src=small.matches&&motion.mobileVideo?motion.mobileVideo:motion.video;player!.load();}
    async function play(){source();try{await player!.play();}catch{if(!disposed)setFailed(true);}}
    function sync(){if(visible.current&&!document.hidden&&!reduced.current)void play();else player!.pause();}
    const loadObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)&&!reduced.current){source();loadObserver.disconnect();}},{rootMargin:'160px'});
    const playObserver=new IntersectionObserver(entries=>{visible.current=entries[0].intersectionRatio>=.2;sync();},{threshold:[0,.2]});
    const preferenceChanged=()=>{reduced.current=preference.matches||saveData;sync();};
    const formatChanged=()=>{if(loaded){loaded=false;source();sync();}};
    loadObserver.observe(root);playObserver.observe(root);document.addEventListener('visibilitychange',sync);preference.addEventListener('change',preferenceChanged);small.addEventListener('change',formatChanged);
    return()=>{disposed=true;loadObserver.disconnect();playObserver.disconnect();document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',preferenceChanged);small.removeEventListener('change',formatChanged);player.pause();player.removeAttribute('src');player.load();};
  },[motion.video,motion.mobileVideo]);
  return <section ref={section} className="case-motion" aria-label={motion.title||'Project walkthrough'}>
    <header><h2>{motion.title||'See the workflow in motion.'}</h2></header>
    <div className={`case-motion-frame${motion.mobileVideo?' case-motion-frame--mobile':''}`}>
      {motion.poster&&<picture className="case-motion-poster" aria-hidden="true">{motion.mobilePoster&&<source media="(max-width:640px)" srcSet={motion.mobilePoster}/>}<img src={motion.poster} alt="" loading="lazy"/></picture>}
      <video ref={video} muted loop playsInline preload="none" style={{opacity:failed?0:1}} aria-label={motion.title||'Project walkthrough'} onPlaying={()=>setFailed(false)} onError={()=>setFailed(true)}/>
    </div>
  </section>;
}
export function CaseMotion({motion,portal=false}:{motion:CaseMotionConfig|null;portal?:boolean}){
  const [slot,setSlot]=useState<Element|null>(null);
  useEffect(()=>{if(portal)setSlot(document.querySelector('[data-cms-motion-slot]'));},[portal]);
  if(!motion)return null;
  return portal?(slot?createPortal(<MotionPlayer motion={motion}/>,slot):null):<MotionPlayer motion={motion}/>;
}
