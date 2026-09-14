"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { FileText } from '@/components/desktop-icons';

type Props = {
  id:string; title:string; className?:string; children:ReactNode; visible:boolean;
  focused:boolean; z:number; reset:number; task:string; icon?:ReactNode; footer?:ReactNode;
  onFocus:()=>void; onClose:()=>void; onRestore:()=>void;
};
const origin = {x:0,y:0,rx:0,ry:0,rz:0};
export function DesktopWindow({id,title,className='',children,visible,focused,z,reset,task,icon,footer,onFocus,onClose,onRestore}:Props) {
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty=useRef(false);
  const position=useRef({x:0,y:0});
  const gesture = useRef<{x:number;y:number;mode:string;start:typeof origin;rect:DOMRect;corner:string;axis?:'pitch'|'yaw'}|null>(null);
  const reduced = useReducedMotion();
  const [pose,setPose] = useState(origin);
  const [pivot,setPivot] = useState('50% 50%');
  const [held,setHeld] = useState(false);
  const [maximized,setMaximized] = useState(false);
  const [target,setTarget] = useState({x:0,y:600});

  function restore() { position.current={x:0,y:0}; restoreInteraction(); }
  function restoreInteraction() {
    if(timer.current)clearTimeout(timer.current);
    gesture.current=null;setHeld(false);setPose({...origin,...position.current});
    // Keep the active hinge while the spring unwinds the actual released pose.
    if(dirty.current){dirty.current=false;onRestore();}
  }
  function scheduleReset() {
    if(timer.current) clearTimeout(timer.current);
    timer.current=setTimeout(restoreInteraction,10000);
  }
  useEffect(() => { restore(); },[reset]);
  useEffect(() => {
    if (!visible) { restore(); setMaximized(false); }
    const rect=ref.current?.getBoundingClientRect();
    const button=document.querySelector(`[data-task="${task}"]`)?.getBoundingClientRect();
    if(visible && rect && button) setTarget({x:button.left + button.width/2 - rect.left - rect.width/2,y:button.top-rect.top});
  },[visible,task]);
  useEffect(() => {
    const outside=(e:globalThis.PointerEvent)=>{if(!ref.current?.contains(e.target as Node))restoreInteraction();};
    const scroll=()=>restoreInteraction();
    document.addEventListener('pointerdown',outside);
    document.addEventListener('scroll',scroll,true);
    window.addEventListener('blur',restoreInteraction);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('scroll',scroll,true);window.removeEventListener('blur',restoreInteraction);if(timer.current)clearTimeout(timer.current);};
  },[]);

  function start(e:PointerEvent,mode:string,corner='50% 50%') {
    if(e.button!==0 || window.innerWidth<=640 || maximized)return;
    if(mode==='drag' && (e.target as HTMLElement).closest('button'))return;
    e.preventDefault();e.stopPropagation();onFocus();
    const rect=ref.current!.getBoundingClientRect();
    gesture.current={x:e.clientX,y:e.clientY,mode,start:pose,rect,corner};
    dirty.current=mode==='spin';
    setPivot(corner);setHeld(true);if(mode==='spin')scheduleReset();e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e:PointerEvent) {
    const g=gesture.current;if(!g)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(g.mode==='spin') {
      if(!g.axis&&Math.hypot(dx,dy)>4){
        g.axis=Math.abs(dx)>Math.abs(dy)?'yaw':'pitch';
        if(g.axis==='yaw')setPivot(`${dx<0?0:100}% ${g.corner.split(' ')[1]}`);
      }
      const limit=reduced?4:75;
      const yawLimit=reduced?4:180;
      // Pitch follows vertical movement; yaw turns the page without screen-plane roll.
      setPose({...g.start,rx:Math.max(-limit,Math.min(limit,g.start.rx-dy*.25)),ry:Math.max(-yawLimit,Math.min(yawLimit,g.start.ry+dx*.35)),rz:0});
    } else {
      position.current={x:g.start.x+Math.max(12-g.rect.left,Math.min(window.innerWidth-g.rect.right-12,dx)),y:g.start.y+Math.max(6-g.rect.top,Math.min(window.innerHeight-90-g.rect.top,dy))};
      setPose({...g.start,...position.current});
    }
    if(g.mode==='spin')scheduleReset();
  }
  function end(){
    const g=gesture.current;if(!g)return;
    if(timer.current)clearTimeout(timer.current);
    if(g.mode==='spin'){restoreInteraction();return;}
    gesture.current=null;setHeld(false);
  }
  return <motion.section ref={ref} id={`window-${id}`} data-window={id} data-visible={visible} aria-label={title} inert={!visible}
    className={`xp-window ${className} ${focused?'focused':'unfocused'} ${maximized?'maximized':''}`}
    style={{zIndex:z,transformOrigin:pivot,pointerEvents:visible?'auto':'none'}}
    animate={{x:visible?pose.x:target.x,y:visible?pose.y:target.y,rotateX:visible?pose.rx:0,rotateY:visible?pose.ry:0,rotateZ:visible?pose.rz:0,scale:visible?1:.015,opacity:visible?1:0}}
    initial={false} transition={reduced?{duration:0}:held?{duration:0}:{type:'spring',stiffness:260,damping:28}}
    onAnimationComplete={()=>{if(!gesture.current)setPivot('50% 50%');}}
    onPointerDown={onFocus} onKeyDown={e=>{if(e.key==='Escape')restore();}}>
    <header className="titlebar" onPointerDown={e=>start(e,'drag')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onDoubleClick={()=>{restore();setMaximized(!maximized);}}>
      {icon || <FileText size={16}/>}<span>{title}</span>
      <div className="window-controls">
        <button aria-label={`Minimize ${title}`} title="Minimize" onClick={onClose}><Minus size={15}/></button>
        <button aria-label={`${maximized?'Restore':'Maximize'} ${title}`} title={maximized?'Restore':'Maximize'} onClick={()=>{restore();setMaximized(!maximized);}}>{maximized?<Copy size={13}/>:<Square size={13}/>}</button>
        <button className="close-control" aria-label={`Close ${title}`} title="Close" onClick={onClose}><X size={18}/></button>
      </div>
    </header>
    {children}
    <footer className="statusbar">{footer || <><span>{title.split(' - ')[0]}</span><span>UTF-8</span></>}</footer>
    {['top-left','top-right','bottom-left','bottom-right'].map((corner,i)=><button key={corner} className={`spin-corner ${corner}`} aria-label={`Spin ${title} from ${corner} corner`} title="Hold to spin" onPointerDown={e=>start(e,'spin',`${i%2?100:0}% ${i>1?100:0}%`)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();dirty.current=true;const limit=reduced?4:75;setPose(p=>({...p,ry:Math.max(-limit,Math.min(limit,p.ry+(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0))),rx:Math.max(-limit,Math.min(limit,p.rx+(e.key==='ArrowUp'?10:e.key==='ArrowDown'?-10:0))),rz:0}));scheduleReset();}}} />)}
  </motion.section>;
}
