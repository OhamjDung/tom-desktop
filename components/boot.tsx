"use client";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { assets } from '@/lib/portfolio';

export function Boot({onComplete}:{onComplete:()=>void}) {
  const reduced=useReducedMotion();
  const [phase,setPhase]=useState('boot');
  useEffect(()=>{
    const transition=setTimeout(()=>setPhase('zoom'),reduced?100:1800);
    const done=setTimeout(onComplete,reduced?200:2900);
    const skip=()=>onComplete();
    const key=(e:KeyboardEvent)=>{if(['Enter','Escape',' ','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();skip();}};
    window.addEventListener('wheel',skip,{passive:true});window.addEventListener('keydown',key);
    return()=>{clearTimeout(transition);clearTimeout(done);window.removeEventListener('wheel',skip);window.removeEventListener('keydown',key);};
  },[onComplete,reduced]);
  return <motion.div className="boot" role="dialog" aria-label="Starting Tom's desktop" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.35}}>
    <motion.div className="boot-scene" animate={{scale:phase==='zoom'&&!reduced?2.6:1,opacity:phase==='zoom'?.25:1}} transition={{duration:1.1,ease:[.65,0,.35,1]}}>
      {assets.bootVideo?<video autoPlay muted playsInline poster={assets.computer} onEnded={onComplete} onError={()=>setPhase('zoom')} src={assets.bootVideo}/>:<img src={assets.computer} alt="A beige CRT computer, keyboard, and tower"/>}
      <div className="boot-screen"><span>portfolio.exe</span><div className="boot-loader"><i/><i/><i/></div><small>starting personal desktop...</small></div>
    </motion.div>
    <button className="skip-boot" onClick={onComplete}>Skip intro</button>
  </motion.div>;
}
