"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { assets } from '@/lib/portfolio';

export function Boot({onComplete,onReveal}:{onComplete:()=>void;onReveal:()=>void}) {
  const reduced=useReducedMotion();
  const longVideo=useRef<HTMLVideoElement>(null);
  const shortVideo=useRef<HTMLVideoElement>(null);
  const mode=useRef<'long'|'short'>('long');
  const [phase,setPhase]=useState<'long'|'short'>('long');
  const [shortReady,setShortReady]=useState(false);
  const [blocked,setBlocked]=useState(false);
  const [paused,setPaused]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const revealedRef=useRef(false);
  const touchY=useRef<number|null>(null);

  const play=useCallback(async()=>{
    const video=mode.current==='long'?longVideo.current:shortVideo.current;
    if(!video)return;
    if(video.error&&mode.current==='short'){onComplete();return;}
    try {await video.play();setBlocked(false);setPaused(false);}
    catch(error) {if(error instanceof DOMException&&error.name==='AbortError')return;setBlocked(true);}
  },[onComplete]);
  const skip=useCallback(()=>{
    if(revealedRef.current)return;
    if(mode.current==='short'){
      const video=shortVideo.current;
      if(!video||video.paused){void play();return;}
      revealedRef.current=true;setRevealed(true);onReveal();return;
    }
    mode.current='short';longVideo.current?.pause();
    setPhase('short');setPaused(false);setBlocked(false);
    void play();
  },[onReveal,play]);
  useEffect(()=>{void play();},[play]);
  useEffect(()=>{const videos=[longVideo.current,shortVideo.current];return()=>{videos.forEach(video=>video?.pause());};},[]);
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
  function togglePause(){const video=mode.current==='long'?longVideo.current:shortVideo.current;if(video?.paused){void play();}else{video?.pause();setPaused(true);}}

  return <motion.div className={`boot video-boot ${revealed?'audio-only':''}`} data-intro={phase} data-revealed={revealed} role={revealed?undefined:'dialog'} aria-modal={revealed?undefined:true} aria-hidden={revealed} aria-label="Starting Tom's desktop" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.2}}>
    <video ref={longVideo} className="intro-video" playsInline preload="auto" poster={assets.computer} src={assets.introLong} aria-label="Full computer startup" onEnded={()=>{if(mode.current==='long')onComplete();}} onError={()=>{if(mode.current==='long')skip();}}/>
    <video ref={shortVideo} className={`intro-video short-intro ${shortReady?'is-playing':''}`} playsInline preload="auto" src={assets.introShort} aria-label="Short computer startup" onPlaying={()=>setShortReady(true)} onEnded={()=>{if(mode.current==='short')onComplete();}} onError={()=>{if(mode.current==='short')onComplete();}}/>
    <div className="intro-controls">
      <button className="intro-pause" onClick={togglePause} aria-label={paused?'Resume intro':'Pause intro'} title={paused?'Resume intro':'Pause intro'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>
      <button className="skip-boot" onClick={skip}>{phase==='short'?'Open desktop':'Skip intro'}</button>
    </div>
    {blocked&&<button className="play-intro" onClick={()=>void play()}><Play size={18}/>Play intro</button>}
  </motion.div>;
}
