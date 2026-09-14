"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { assets } from '@/lib/portfolio';

export function Boot({onComplete,onReveal}:{onComplete:()=>void;onReveal:()=>void}) {
  const reduced=useReducedMotion();
  const shortVideo=useRef<HTMLVideoElement>(null);
  const [blocked,setBlocked]=useState(false);
  const [paused,setPaused]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const revealedRef=useRef(false);
  const touchY=useRef<number|null>(null);

  const play=useCallback(async()=>{
    const video=shortVideo.current;
    if(!video)return;
    if(video.error){onComplete();return;}
    try {await video.play();setBlocked(false);setPaused(false);}
    catch(error) {if(error instanceof DOMException&&error.name==='AbortError')return;setBlocked(true);}
  },[onComplete]);
  const skip=useCallback(()=>{
    if(revealedRef.current)return;
    const video=shortVideo.current;
    if(!video||video.paused){void play();return;}
    revealedRef.current=true;setRevealed(true);onReveal();
  },[onReveal,play]);
  useEffect(()=>{void play();return()=>shortVideo.current?.pause();},[play]);
  useEffect(()=>{
    if(revealed)return;
    const wheel=(e:WheelEvent)=>{if(e.ctrlKey||!e.deltaY)return;e.preventDefault();skip();};
    const key=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement).closest('button'))return;
      if(['Enter','Escape',' ','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();skip();}
    };
    const touchStart=(e:TouchEvent)=>{touchY.current=e.touches[0]?.clientY??null;};
    const touchMove=(e:TouchEvent)=>{if(touchY.current!==null&&Math.abs((e.touches[0]?.clientY??touchY.current)-touchY.current)>25)skip();};
    window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);
    window.addEventListener('touchstart',touchStart,{passive:true});window.addEventListener('touchmove',touchMove,{passive:true});
    return()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);};
  },[skip,revealed]);
  function togglePause(){const video=shortVideo.current;if(video?.paused){void play();}else{video?.pause();setPaused(true);}}

  return <motion.div className={`boot video-boot ${revealed?'audio-only':''}`} data-intro="short" data-revealed={revealed} role={revealed?undefined:'dialog'} aria-modal={revealed?undefined:true} aria-hidden={revealed} aria-label="Starting Tom's desktop" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.2}}>
    <video ref={shortVideo} className="intro-video" playsInline preload="auto" poster={assets.computer} src={assets.introShort} aria-label="Computer startup" onEnded={onComplete} onError={onComplete}/>
    <div className="intro-controls">
      <button className="intro-pause" onClick={togglePause} aria-label={paused?'Resume intro':'Pause intro'} title={paused?'Resume intro':'Pause intro'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>
      <button className="skip-boot" onClick={skip}>Open desktop</button>
    </div>
    {blocked&&<button className="play-intro" onClick={()=>void play()}><Play size={18}/>Play intro</button>}
  </motion.div>;
}
