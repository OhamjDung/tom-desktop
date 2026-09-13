import { fallbackProjects, parseProjects } from '@/lib/portfolio';
export async function GET() {
  const base=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!base||!key) return Response.json({projects:fallbackProjects,source:'local'});
  try {
    const url=new URL('/rest/v1/projects',base);
    url.searchParams.set('select','*');url.searchParams.set('status','eq.published');url.searchParams.set('order','sort_order.asc');
    const response=await fetch(url,{headers:{apikey:key},signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error('Feed unavailable');
    const projects=parseProjects(await response.json());
    return Response.json({projects,source:'supabase'},{headers:{'Cache-Control':'public, max-age=60'}});
  } catch {return Response.json({projects:fallbackProjects,source:'fallback'});}
}
