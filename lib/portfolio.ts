import projectRows from '@/lib/projects.json';

export const profile = {
  name: 'Tom Pham', email: 'QuocDung.Pham@UTDallas.edu', linkedin: 'https://www.linkedin.com/in/datatompham/', github: 'https://github.com/OhamjDung',
  intro: "I turn messy data into decisions. Pipelines that don't lose records, dashboards people actually read, and models that hold up when the data changes.",
  about: 'Software engineer by training, analyst by habit. I like problems that start with "what does this data say?" and end with something shipped.',
  currently: 'Currently: CS at UT Dallas, leading student teams through hackathons and semester projects, and building AI agents that do the analysis for you.',
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
const personalDesktop: Project = {
  id:'personal-desktop', slug:'personal-desktop', title:'Personal Desktop',
  short_description:'A portfolio inside a Windows XP desktop. Familiar windows, unexpected interactions.',
  role:'Design & development', year:'2026', tags:['React','Interaction design','Figma'],
  cover_image_url:'/assets/desktop-preview.png', gallery_image_urls:['/assets/computer.png'],
  case_study_url:'', live_url:'', github_url:'', featured:true, sort_order:99, status:'published',
  description:'The idea begins with an old computer booting up. The screen becomes a personal desktop, with writing in Notepad and photographs in image viewers. Scrolling reveals the next part of the story; the taskbar gives a direct route to the work. Windows can be picked up, tilted, and put back. This portfolio is the first project in the collection.',
};
// The Projects window reads this list directly. To add or edit a project, edit lib/projects.json
// (rows show in file order). Cover images go in public/assets/ and are referenced as '/assets/<file>'.
export const projects: Project[] = [
  ...(projectRows as Partial<Project>[]).map((p, index): Project => ({
    id: String(p.slug), slug: String(p.slug), title: String(p.title),
    short_description: p.short_description || '', description: p.description || '',
    role: p.role || '', year: p.year || '', tags: p.tags || [],
    cover_image_url: p.cover_image_url || '', gallery_image_urls: p.gallery_image_urls || [],
    case_study_url: p.case_study_url || '', live_url: p.live_url || '', github_url: p.github_url || '',
    featured: Boolean(p.featured), sort_order: p.sort_order ?? index, status: 'published',
  })),
  personalDesktop,
];
