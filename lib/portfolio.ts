export const profile = {
  name: 'Tom Pham', email: 'QuocDung.Pham@UTDallas.edu', linkedin: '', github: '',
  intro: 'I build thoughtful digital experiences with a focus on interaction, visual systems, and useful products.',
  about: 'I like work that feels personal, precise, and a little unexpected.',
  currently: 'Exploring product storytelling and the space between design and engineering.',
};
// The final transparent monitor frame can be connected when supplied.
export const assets = {
  introShort: '/assets/IntroShort.mp4',
  monitorFrame: null as string | null,
  computer: '/assets/computer.png', wallpaper: '/assets/wallpaper-bliss.webp', portrait: '/assets/portrait.png',
};
export type Project = {
  id: string; slug: string; title: string; short_description: string;
  role: string; year: string; tags: string[]; cover_image_url: string;
  gallery_image_urls: string[]; case_study_url: string; live_url: string;
  github_url: string; featured: boolean; sort_order: number;
  status: string; description?: string;
};
export const fallbackProjects: Project[] = [{
  id:'personal-desktop', slug:'personal-desktop', title:'Personal Desktop',
  short_description:'A portfolio inside a Windows XP desktop. Familiar windows, unexpected interactions.',
  role:'Design & development', year:'2026', tags:['React','Interaction design','Figma'],
  cover_image_url:'/assets/desktop-preview.png', gallery_image_urls:['/assets/computer.png'],
  case_study_url:'', live_url:'', github_url:'', featured:true, sort_order:0, status:'published',
  description:'The idea begins with an old computer booting up. The screen becomes a personal desktop, with writing in Notepad and photographs in image viewers. Scrolling reveals the next part of the story; the taskbar gives a direct route to the work. Windows can be picked up, tilted, and put back. This portfolio is the first project in the collection.',
}];
export function safeLink(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function parseProjects(input: unknown): Project[] {
  if (!Array.isArray(input)) throw new Error('Invalid project feed');
  return input.filter((p): p is Record<string, unknown> => !!p && typeof p === 'object' && typeof p.title === 'string' && typeof p.id === 'string').map((p, index) => ({
    id: String(p.id), slug: String(p.slug || p.id), title: String(p.title),
    short_description: String(p.short_description || ''), description: String(p.description || ''),
    role: String(p.role || ''), year: String(p.year || ''),
    tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : [],
    cover_image_url: safeLink(p.cover_image_url),
    gallery_image_urls: Array.isArray(p.gallery_image_urls) ? p.gallery_image_urls.map(safeLink).filter(Boolean) : [],
    case_study_url:safeLink(p.case_study_url), live_url:safeLink(p.live_url), github_url:safeLink(p.github_url),
    featured: Boolean(p.featured), sort_order: Number(p.sort_order) || index, status:String(p.status || 'published'),
  }));
}
