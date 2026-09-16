"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Code2 as Github, BriefcaseBusiness as Linkedin, RotateCcw, Volume2 } from 'lucide-react';
import { FileText, FolderOpen, ImageIcon, Mail, Monitor } from '@/components/desktop-icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DesktopWindow } from '@/components/desktop-window';
import { Boot } from '@/components/boot';
import { assets, profile, fallbackProjects, type Project } from '@/lib/portfolio';
import './desktop.css';

type Section='about'|'projects'|'contact';
const sections=[{id:'about' as Section,label:'About Me',Icon:FileText},{id:'projects' as Section,label:'Projects',Icon:FolderOpen},{id:'contact' as Section,label:'Contact Me',Icon:Mail}];
const groups:Record<Section,string[]>={about:['about','photo'],projects:['projects'],contact:['contact']};

function ProjectImage({src,alt}:{src:string;alt:string}) {
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[src]);
  return src&&!broken?<img src={src} alt={alt} loading="lazy" onError={()=>setBroken(true)}/>:<div className="image-fallback"><ImageIcon size={30}/><span>Image unavailable</span></div>;
}

export default function Home() {
  const [booting,setBooting]=useState(false);
  const [introMounted,setIntroMounted]=useState(false);
  const [started,setStarted]=useState(false);
  const startedRef=useRef(false);
  const [introSession,setIntroSession]=useState(0);
  const embedded=typeof window!=='undefined'&&window.parent!==window;
  const wakePending=useRef(false);
  const [active,setActive]=useState<Section>('about');
  const [open,setOpen]=useState<string[]>([]);
  const [focused,setFocused]=useState('about');
  const [order,setOrder]=useState(['contact','projects','about','photo']);
  const [completed,setCompleted]=useState(false);
  const [reset,setReset]=useState(0);
  const [clock,setClock]=useState('');
  const [copied,setCopied]=useState(false);
  const [copyError,setCopyError]=useState(false);
  const [projects,setProjects]=useState<Project[]>(fallbackProjects);
  const [loading,setLoading]=useState(true);
  const [feedFailed,setFeedFailed]=useState(false);
  const [selected,setSelected]=useState<Project|null>(null);
  const [photoZoom,setPhotoZoom]=useState(false);
  const scrollLock=useRef(0);
  const wheel=useRef({total:0,last:0});
  const touch=useRef<{x:number;y:number;target:EventTarget|null}|null>(null);
  const copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const finishBoot=useCallback(()=>{setBooting(false);scrollLock.current=Date.now()+500;},[]);
  const completeIntro=useCallback(()=>{
    setBooting(false);setIntroMounted(false);
    if(wakePending.current){wakePending.current=false;startedRef.current=true;setStarted(true);setActive('about');setFocused('about');setOpen(groups.about);}
  },[]);
  const replayIntro=()=>{setIntroSession(n=>n+1);setIntroMounted(true);setBooting(true);};

  const focus=(id:string)=>{setFocused(id);setOrder(old=>[...old.filter(x=>x!==id),id]);};
  const resetWindows=()=>{setReset(v=>v+1);setOrder(['contact','projects','about','photo']);};
  function go(id:Section,via:'task'|'story'|'shortcut'='task') {
    startedRef.current=true;setStarted(true);resetWindows();setActive(id);setFocused(id);setSelected(null);
    setOrder(['contact','projects','photo','about'].filter(x=>!groups[id].includes(x)).concat(groups[id]));
    setOpen(old=>completed&&via==='task'?(groups[id].some(x=>old.includes(x))?old.filter(x=>!groups[id].includes(x)):window.innerWidth<=640?groups[id]:[...old,...groups[id]]):groups[id]);
  }
  function close(id:string) {
    setOpen(old=>old.filter(x=>x!==id));
    const section=id==='photo'?'about':id;
    requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>(`[data-task="${section}"]`)?.focus());
  }
  function advance(direction:number) {
    if(booting)return;
    if(Date.now()<scrollLock.current)return;
    scrollLock.current=Date.now()+650;resetWindows();
    if(!started&&direction<0)return;
    const current=started?sections.findIndex(s=>s.id===active):-1;
    const next=Math.max(0,Math.min(2,current+direction));
    if(direction>0&&next===2)setCompleted(true);
    go(sections[next].id,'story');
  }
  useEffect(()=>{
    if(window.parent===window)return;
    const wake=(event:MessageEvent)=>{
      if(event.source!==window.parent||event.data?.type!=='wake-desktop'||startedRef.current||wakePending.current)return;
      // The room woke the monitor: run the intro to completion, then open About.
      wakePending.current=true;setIntroSession(n=>n+1);setIntroMounted(true);setBooting(true);
    };
    window.addEventListener('message',wake);
    // The room may reach the desk before this iframe has hydrated.
    window.parent.postMessage({type:'desktop-ready'},'*');
    return()=>window.removeEventListener('message',wake);
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/projects',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Projects unavailable');return r.json() as Promise<{projects:Project[];source:string}>;}).then(data=>{if(!Array.isArray(data.projects))throw new Error('Invalid feed');setProjects(data.projects);setFeedFailed(data.source==='fallback');}).catch(e=>{if(e.name!=='AbortError')setFeedFailed(true);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{const update=()=>setClock(new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}));update();const timer=setInterval(update,30000);return()=>clearInterval(timer);},[]);
  useEffect(()=>()=>{if(copyTimer.current)clearTimeout(copyTimer.current);},[]);
  useEffect(()=>{const scroller=document.querySelector('.project-content');if(scroller)scroller.scrollTop=0;},[selected]);
  useEffect(()=>{
    if(booting)return;
    const isBackground=(target:EventTarget|null)=>target instanceof Element&&!target.closest('.xp-window,.taskbar,.desktop-icons,[role="menu"],[data-slot="dropdown-menu-content"]');
    const onWheel=(e:WheelEvent)=>{
      if(e.ctrlKey||!isBackground(e.target)){wheel.current.total=0;return;}
      e.preventDefault();setReset(v=>v+1);
      const now=Date.now(),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?window.innerHeight:1);
      if(delta<0&&window.parent!==window){wheel.current.total=0;window.parent.postMessage({type:'room-wheel',deltaY:delta},'*');return;}
      if(now-wheel.current.last>180||Math.sign(delta)!==Math.sign(wheel.current.total))wheel.current.total=0;
      wheel.current.last=now;wheel.current.total+=delta;
      if(Math.abs(wheel.current.total)>25){advance(Math.sign(wheel.current.total));wheel.current.total=0;}
    };
    const key=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement).closest('button,a,input,textarea,[role="menu"]') || !isBackground(e.target))return;
      if(['PageDown','ArrowDown','PageUp','ArrowUp',' '].includes(e.key)){e.preventDefault();advance(['PageUp','ArrowUp'].includes(e.key)?-1:1);}
    };
    const onTouchStart=(e:TouchEvent)=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY,target:e.target};};
    const onTouchEnd=(e:TouchEvent)=>{if(!touch.current)return;const dy=touch.current.y-e.changedTouches[0].clientY,dx=touch.current.x-e.changedTouches[0].clientX;if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)&&isBackground(touch.current.target)){if(dy<0&&window.parent!==window)window.parent.postMessage({type:'room-wheel',deltaY:dy},'*');else advance(Math.sign(dy));}touch.current=null;};
    window.addEventListener('wheel',onWheel,{passive:false});window.addEventListener('keydown',key);window.addEventListener('touchstart',onTouchStart,{passive:true});window.addEventListener('touchend',onTouchEnd,{passive:true});
    return()=>{window.removeEventListener('wheel',onWheel);window.removeEventListener('keydown',key);window.removeEventListener('touchstart',onTouchStart);window.removeEventListener('touchend',onTouchEnd);};
  },[active,completed,booting,started]);
  async function copyEmail() {
    try {await navigator.clipboard.writeText(profile.email);setCopied(true);setCopyError(false);if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(false),2500);}catch{setCopyError(true);}
  }
  function windowProps(id:string,task:Section){return {id,task,visible:open.includes(id),focused:focused===id,z:10+order.indexOf(id),reset,onFocus:()=>focus(id),onClose:()=>close(id),onRestore:()=>setOrder(['contact','projects','about','photo'])};}

  return <main className="desktop" data-started={started} data-section={started?active:'blank'} data-story-complete={completed} aria-label={started?'Tom Pham desktop':'Tom Pham portfolio'} tabIndex={-1}>
    <div className="wallpaper" style={{backgroundImage:`url('${assets.wallpaper}')`}}/>
    <div className="desktop-content" inert={booting||!started}>
      <div className="desktop-icons" aria-label="Desktop shortcuts">{sections.map(({id,label,Icon})=><button key={id} onClick={()=>go(id,'shortcut')}><Icon size={48}/><span>{label}</span></button>)}</div>
      <div className="desktop-caption" aria-hidden="true"><span>Tom's personal desktop</span><span>{String(sections.findIndex(s=>s.id===active)+1).padStart(2,'0')} / 03</span></div>
      <div className="window-stage">
        <DesktopWindow {...windowProps('photo','about')} title="me.jpg - Picture Viewer" className="photo-window" icon={<ImageIcon size={16}/>} footer={<><span>me.jpg</span><button className="plain-button" onClick={()=>setPhotoZoom(!photoZoom)}>{photoZoom?'Fit to window':'100%'}</button></>}>
          <div className={`photo-content ${photoZoom?'zoomed':''}`} data-scrollable><img src={assets.portrait} alt="Tom Pham"/></div>
        </DesktopWindow>
        <DesktopWindow {...windowProps('about','about')} title="about-me.txt - Notepad" className="main-window about-window">
          <div className="menubar"><WindowMenu label="File" onClose={()=>close('about')}/><WindowMenu label="View" onClose={()=>close('about')} onReset={resetWindows}/></div>
          <div className="paper" data-scrollable><p className="file-label">PERSONAL / ABOUT ME</p><h1>Hi, I'm Tom.</h1><p>{profile.intro}</p><p>{profile.about}</p><hr/><dl><dt>Focus</dt><dd>Frontend, product & interaction design</dd><dt>Tools</dt><dd>React, Figma, Supabase</dd><dt>Looking for</dt><dd>Roles where design and engineering meet</dd></dl><p className="currently">{profile.currently}</p><img className="mobile-portrait" src={assets.portrait} alt="Tom Pham"/></div>
        </DesktopWindow>
        <DesktopWindow {...windowProps('projects','projects')} title="projects.exe - Explorer" className="projects-window" icon={<FolderOpen size={16}/>} footer={<><span>{loading?'Loading projects...':`${projects.length} ${projects.length===1?'project':'projects'}`}</span><span>{feedFailed?'Saved collection':'Selected work'}</span></>}>
          <div className="explorer-toolbar"><button aria-label="Back to projects" title="Back to projects" disabled={!selected} onClick={()=>setSelected(null)}><ArrowLeft size={20}/></button><span className="address"><FolderOpen size={16}/>Tom Pham / Projects{selected?` / ${selected.title}`:''}</span></div>
          <div className="project-layout"><aside className="explorer-sidebar"><strong>Projects</strong><button onClick={()=>setSelected(null)} className={!selected?'selected':''}><FolderOpen size={16}/>Selected work</button><div><span>Details</span><p>{selected?.role||'A collection of things I design and build.'}</p></div></aside>
            <div className="project-content" data-scrollable>{selected?<article className="project-detail"><div className="detail-cover"><ProjectImage src={selected.cover_image_url} alt={selected.title}/></div><div className="project-heading"><h1>{selected.title}</h1><span>{selected.year}</span></div><p>{selected.short_description}</p><dl><dt>Role</dt><dd>{selected.role}</dd><dt>Tools</dt><dd>{selected.tags.join(', ')}</dd></dl><p>{selected.description}</p><div className="project-links">{[[selected.case_study_url,'Case study'],[selected.live_url,'Live site'],[selected.github_url,'GitHub']].filter(([url])=>url).map(([url,label])=><a key={label} className="xp-button" href={url} target="_blank" rel="noreferrer">{label}<ExternalLink size={14}/></a>)}</div>{selected.gallery_image_urls.map((url,i)=><div key={url} className="gallery-image"><ProjectImage src={url} alt={`${selected.title}, image ${i+1}`}/></div>)}</article>:<><header className="project-intro"><p className="file-label">WORK / SELECTED PROJECTS</p><h1>Things I've been building.</h1><p>Selected projects that show how I think, design, and build.</p></header><div className="project-grid">{projects.map(project=><button className="project-file" key={project.id} onClick={()=>setSelected(project)}><div className="project-cover"><ProjectImage src={project.cover_image_url} alt={`${project.title} preview`}/><span className="project-year">{project.year}</span></div><div className="project-file-body"><span className="project-file-title"><FolderOpen size={20}/><strong>{project.title}</strong><ArrowRight size={18}/></span><p>{project.short_description}</p><small>{project.tags.join(' / ')}</small></div></button>)}</div>{!loading&&projects.length===0&&<p className="empty-projects">No published projects yet.</p>}</>}</div>
          </div>
        </DesktopWindow>
        <DesktopWindow {...windowProps('contact','contact')} title="contact-me.txt - Address Book" className="contact-window" icon={<Mail size={16}/>} footer={<><span>Tom Pham</span><span>Contact</span></>}>
          <div className="paper contact-paper" data-scrollable><p className="file-label">PERSONAL / CONTACT</p><Mail className="contact-stamp" size={43}/><h1>Let's make<br/>something good.</h1><p>Want to talk about a role, project, or collaboration?</p><a className="email-address" href={`mailto:${profile.email}`}>{profile.email}</a><div className="contact-actions"><a className="xp-button primary" href={`mailto:${profile.email}`}><Mail size={16}/>Write an email</a><button className="xp-button" onClick={copyEmail}>{copied?<Check size={16}/>:<Copy size={16}/>}<span aria-live="polite">{copied?'Copied!':'Copy email'}</span></button></div>{copyError&&<p role="status" className="copy-error">Copy unavailable. Select the email address above.</p>}<hr/><div className="social-links">{profile.linkedin?<a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18}/>LinkedIn<ExternalLink size={13}/></a>:<span><Linkedin size={18}/>LinkedIn <small>Coming soon</small></span>}{profile.github?<a href={profile.github} target="_blank" rel="noreferrer"><Github size={18}/>GitHub<ExternalLink size={13}/></a>:<span><Github size={18}/>GitHub <small>Coming soon</small></span>}</div></div>
        </DesktopWindow>
      </div>
      {assets.monitorFrame&&<img className="monitor-frame" src={assets.monitorFrame} alt=""/>}
      <nav className="taskbar" aria-label="Portfolio navigation">
        <DropdownMenu><DropdownMenuTrigger asChild><button className="start-button" aria-label="Start menu"><Monitor/>start</button></DropdownMenuTrigger><DropdownMenuContent side="top" align="start" className="start-menu"><div className="start-profile"><img src={assets.portrait} alt=""/><strong>Tom Pham</strong></div>{sections.map(({id,label,Icon})=><DropdownMenuItem key={id} onSelect={()=>go(id,'shortcut')}><Icon/>{label}</DropdownMenuItem>)}<DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>{resetWindows();setCompleted(false);setActive('about');setOpen(['contact','projects','about','photo']);}}><RotateCcw/>Reset desktop</DropdownMenuItem><DropdownMenuItem onSelect={replayIntro}><Monitor/>Replay intro</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        {sections.map(({id,label,Icon})=><button key={id} data-task={id} aria-controls={`window-${id}`} aria-pressed={open.includes(id)} className={`task-button ${active===id&&open.includes(id)?'active':''} ${open.includes(id)?'is-open':''}`} onClick={()=>go(id)}><Icon size={16}/><span>{label}</span></button>)}
        <div className="tray"><Volume2 size={17} aria-label="Sound enabled"/><time suppressHydrationWarning>{clock}</time></div>
      </nav>
      <div className="sr-only" aria-live="polite">{sections.find(s=>s.id===active)?.label}{completed?'. Story complete. Taskbar buttons now toggle windows.':''}</div>
    </div>
    <AnimatePresence>{introMounted&&<Boot key={introSession} locked={embedded} onReveal={finishBoot} onComplete={completeIntro}/>}</AnimatePresence>
  </main>;
}

function WindowMenu({label,onClose,onReset}:{label:string;onClose:()=>void;onReset?:()=>void}) {
  return <DropdownMenu><DropdownMenuTrigger asChild><button className="menu-button">{label}</button></DropdownMenuTrigger><DropdownMenuContent align="start">{onReset?<DropdownMenuItem onSelect={onReset}>Reset window positions</DropdownMenuItem>:<DropdownMenuItem onSelect={onClose}>Close</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>;
}
