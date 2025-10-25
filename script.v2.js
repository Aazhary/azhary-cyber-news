/* سوسو – لود وعرض اخبار + صور احتياطية + مودال ملخص */

const NEWS_URL = './news.json'; // نفس الريبو
const grid = document.getElementById('newsGrid');
const btnMore = document.getElementById('loadMoreBtn');
const searchBox = document.getElementById('searchBox');
const filtersWrap = document.getElementById('filters');

const modal = document.getElementById('newsModal');
const modalClose = document.getElementById('modalClose');
const mTitle = document.getElementById('modalTitle');
const mMeta  = document.getElementById('modalMeta');
const mAr    = document.getElementById('modalAr');
const mEn    = document.getElementById('modalEn');
const mSrc   = document.getElementById('modalSrc');

let all = [];
let view = [];
let idx = 0;
const PAGE = 12;
let activeCat = 'All';
let q = '';

const CATS = ['General','Vulnerability','Threat/Attack','Policy/Advisory','Data Breach','Patch/Update','All'];

// خريطة صور افتراضية حسب التصنيف
const IMG_BY_CAT = {
  'Vulnerability':'img/vuln.jpg',
  'Threat/Attack':'img/attack.jpg',
  'Policy/Advisory':'img/policy.jpg',
  'Data Breach':'img/breach.jpg',
  'Patch/Update':'img/patch.jpg',
  'General':'img/general.jpg',
  'default':'img/general.jpg'
};

// تحميل الأخبار
async function loadNews(){
  const r = await fetch(NEWS_URL, {cache:'no-store'});
  if(!r.ok) throw new Error('news.json not found');
  const data = await r.json();
  // ترتيب الاحدث اولا
  data.sort((a,b)=> new Date(b.published) - new Date(a.published));
  all = data;
  applyFilter();
  buildFilters();
  console.log('NEWS items loaded:', all.length);
}

// الفلاتر
function buildFilters(){
  filtersWrap.innerHTML = '';
  CATS.forEach(cat=>{
    const chip = document.createElement('button');
    chip.className = 'filter-chip'+(cat===activeCat?' active':'');
    chip.textContent = cat;
    chip.onclick = ()=>{ activeCat = cat; applyFilter(true); };
    filtersWrap.appendChild(chip);
  });
}

function applyFilter(reset=false){
  if(reset){ idx=0; view=[]; grid.innerHTML=''; }
  view = all.filter(it=>{
    const byCat = activeCat==='All' || (it.category||'General')===activeCat;
    const qq = q.trim().toLowerCase();
    const byQ  = !qq || (
      (it.title||'').toLowerCase().includes(qq) ||
      (it.summary_en||'').toLowerCase().includes(qq) ||
      (it.summary_ar||'').toLowerCase().includes(qq) ||
      (it.cves||[]).join(' ').toLowerCase().includes(qq)
    );
    return byCat && byQ;
  });
  renderMore(true);
}

function renderMore(reset){
  const end = Math.min(idx+PAGE, view.length);
  for(let i=idx; i<end; i++) grid.appendChild(card(view[i]));
  idx = end;
  btnMore.disabled = idx>=view.length;
}

// كارت خبر
function card(item){
  const cat = item.category || 'General';
  const imgSrc = pickImage(item, cat);
  const el = document.createElement('article');
  el.className='news-card';
  el.innerHTML = `
    <div class="thumb-wrap">
      <img src="${imgSrc}" alt="" onerror="this.src='img/general.jpg'">
    </div>
    <div class="card-body">
      <div class="meta">${(new URL(item.link)).hostname} — ${item.published}</div>
      <a class="title" href="javascript:void(0)">${item.title}</a>
      <span class="badge">${cat}</span>
      <div class="card-actions">
        <button class="btn secondary" type="button">ملخّص</button>
        <a class="btn" href="${item.link}" target="_blank" rel="noopener">المصدر</a>
      </div>
    </div>
  `;
  el.querySelector('.btn.secondary').onclick = ()=> openModal(item);
  el.querySelector('.title').onclick = ()=> openModal(item);
  return el;
}

// اختيار صورة من التصنيف أو من المصدر اذا كانت موجودة بالحقل image
function pickImage(item, cat){
  if(item.image && /^https?:/i.test(item.image)) return item.image;
  const byCat = IMG_BY_CAT[cat] || IMG_BY_CAT.default;
  return byCat;
}

// مودال
function openModal(it){
  mTitle.textContent = it.title || '';
  const host = (new URL(it.link)).hostname;
  mMeta.textContent = `${host} — ${it.published}`;
  mAr.textContent = it.summary_ar || '—';
  mEn.textContent = it.summary_en || '—';
  mSrc.innerHTML   = (it.sources && it.sources.length)
        ? it.sources.map(s=>`<a href="${s}" target="_blank" rel="noopener">${new URL(s).hostname}</a>`).join('، ')
        : `<a href="${it.link}" target="_blank" rel="noopener">${host}</a>`;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
modalClose.onclick = ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }
modal.addEventListener('click', e=>{ if(e.target===modal) modalClose.click(); });

// بحث
searchBox.addEventListener('input', (e)=>{ q = e.target.value; applyFilter(true); });

// المزيد
btnMore.addEventListener('click', ()=> renderMore());

// ابدأ
loadNews().catch(err=>{
  grid.innerHTML = `<div class="section">تعذّر تحميل الأخبار: ${err.message}</div>`;
});
