// 共通: 年表示
const YEAR = document.getElementById('year');
if(YEAR) YEAR.textContent = new Date().getFullYear();

// テーマ切替
const THEME_TOGGLE = document.getElementById('theme-toggle');
const THEME_KEY = 'portfolio-theme';
function applyTheme(theme){
  if(theme==='light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
  if(THEME_TOGGLE) THEME_TOGGLE.textContent = theme==='light'?'☀️':'🌙';
  localStorage.setItem(THEME_KEY, theme);
}
applyTheme(localStorage.getItem(THEME_KEY)||'dark');
THEME_TOGGLE?.addEventListener('click', ()=>{
  const cur = document.documentElement.classList.contains('light')?'light':'dark';
  applyTheme(cur==='light'?'dark':'light');
});

// Heroパララックス & Header出現
const header = document.querySelector('.site-header');
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', ()=>{
  const scrollY = window.scrollY;
  if(scrollY>50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
  if(heroContent) heroContent.style.transform = `translateY(${ -scrollY*0.3 }px)`;
});

// ナビクリックでスムーズスクロール
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({behavior:'smooth'});
  });
});

// IntersectionObserverでアクティブメニュー切替
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(a=>a.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if(link) link.classList.add('active');
    }
  });
},{threshold:0.5});

// Portfolio用: projects.json 読み込み & モーダル
let allProjects = [];
const GALLERY = document.getElementById('gallery');
const MODAL = document.getElementById('modal');
const MODAL_TITLE = document.getElementById('modal-title');
const MODAL_PLAYER = document.getElementById('modal-player');
const MODAL_DESC = document.getElementById('modal-desc');
const MODAL_META = document.getElementById('modal-meta');
const MODAL_CLOSE = document.getElementById('modal-close');
const MODAL_BACKDROP = document.getElementById('modal-backdrop');

async function loadProjects(){
  try{
    const res = await fetch('projects.json',{cache:"no-store"});
    if(!res.ok) throw new Error('projects.json を読み込めませんでした');
    const projects = await res.json();
    allProjects = projects;
    renderGallery(projects);
    initObservers();
  }catch(e){ console.error(e); GALLERY.innerHTML='<p style="color:var(--muted)">projects.json を読み込めませんでした</p>'; }
}

function ytThumbUrl(url){
  const idMatch = url.match(/(?:v=|\/embed\/|\.be\/|\/v\/)([A-Za-z0-9_-]{6,})/);
  const id = idMatch? idMatch[1]: url;
  return { id, thumb:`https://img.youtube.com/vi/${id}/hqdefault.jpg` };
}

function openModal(project){
  const {title, description, tools, youtube} = project;
  const y = ytThumbUrl(youtube);
  MODAL.setAttribute('aria-hidden','false');
  MODAL_TITLE.textContent = title;
  MODAL_DESC.textContent = description||'';
  MODAL_META.innerHTML = tools?`使用ツール：${tools.join(' / ')}`:'';
  MODAL_PLAYER.innerHTML=`<iframe src="https://www.youtube.com/embed/${y.id}?autoplay=1" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  document.body.style.overflow='hidden';
}
function closeModal(){ MODAL.setAttribute('aria-hidden','true'); MODAL_PLAYER.innerHTML=''; document.body.style.overflow=''; }
MODAL_CLOSE?.addEventListener('click',closeModal);
MODAL_BACKDROP?.addEventListener('click',closeModal);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

function renderGallery(projects){
  if(!GALLERY) return;
  GALLERY.innerHTML = projects.map(p=>{
    const y=ytThumbUrl(p.youtube);
    const tagsAttr=(p.tags||[]).join(',');
    const safeTitle=p.title.replace(/</g,'&lt;');
    return `<article class="card" data-id="${p.id}" data-tags="${tagsAttr}">
      <img class="card-thumb" src="${y.thumb}" loading="lazy" alt="${safeTitle} サムネイル">
      <div class="card-overlay"><div class="card-title">${safeTitle}</div></div>
      <div class="card-meta"><div class="tag">${p.year||''}</div></div>
    </article>`;
  }).join('');
  GALLERY.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const id=card.dataset.id;
      const project=allProjects.find(x=>String(x.id)===String(id));
      if(project) openModal(project);
    });
  });
}

function initObservers(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.15});
  document.querySelectorAll('.card').forEach(el=>obs.observe(el));
}

loadProjects();
