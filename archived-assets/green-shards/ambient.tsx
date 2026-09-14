"use client";
import './desktop-integration.css';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
const AeroShards=lazy(()=>import('./effects/AeroShards'));
export function Ambient({enabled}:{enabled:boolean}) {
  const [supported,setSupported]=useState(false);
  const reduced=useReducedMotion();
  useEffect(()=>{setSupported('gpu' in navigator);},[]);
  if(!supported||!enabled||reduced)return null;
  return <div className="ambient"><Suspense fallback={null}><AeroShards backgroundColor="#eef1f2" shardColor="#84CC16" accentColor="#066ef7" placement="right" flow="stream" material="chrome" detail="balanced" effect="dither" scale={1.3} spread={.35} depth={1} speed={.3} spin={2} interaction="attract" density={1.35} shardSize={.95} stretch={1} turbulence={1} glow={1.05} edgeSoftness={2} bloom={.9} grain={.1175} chromaticAberration={.0035} transitionDuration={1} interactionRadius={1.3} interactionStrength={.15} rippleIntensity={1} holdToGather={false} onError={()=>setSupported(false)}/></Suspense></div>;
}
