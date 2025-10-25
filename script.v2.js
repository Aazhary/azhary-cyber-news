// ===== إعدادات عامة =====
const NEWS_URL = "news.json";        // ملف الأخبار في نفس الجذر
const PAGE_SIZE = 12;

let ALL = [];
let FILTERED = [];
let visibleCount = PAGE_SIZE;

// عناصر DOM
const $ = id => document.getElementById(id);

// فتح/غلق المودال
function openModal() { $('newsModal').showModal(); }
function closeModal() { $('newsModal').close(); }
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== Utils =====
const escapeHTML = s => (s||"").toString()
  .replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

const fmtDate = s => {
  try { return new Date(s).toISOString().replace('T',' ').slice(0,16).replace(/:/,':') + "Z"; }
  catch { return s || ""; }
};

function thumbStyle(it){
  const url = (it.img && /^https?:/i.test(it.img)) ? it.img : "";
  return url ? `background-image:url('${url}')`
             : `background-image:linear-gradient(135deg,#0c2830,#0a1f25)`;
}

// ===== بناء البطاقة =====
function card(it){
  const art = document.createElement('article');
  art.className = 'news-card';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  thumb.style = thumbStyle(it);

  const body = document.createElement('div');
  body.className = 'body';
  body.innerHTML = `
    <div class="meta">
      <span>${escapeHTML(it.source || '')}</span>
      <time>${escapeHTML(fmtDate(it.published))}</time>
    </div>
    <h3>${escapeHTML(it.title)}</h3>
    ${it.category ? `<span class="badge">${escapeHTML(it.category)}</span>` : ''}
  `;

  const more = document.createElement('div');
  more.className = 'more';
  more.innerHTML = `
    <span class="pill">${it.cves && it.cves.length ? escapeHTML(it.cves[0]) : (it.tags && it.tags[0] ? escapeHTML(it.tags[0]) : 'خبر')}</span>
    <span style="opacity:.8">قراءة الملخص</span>
  `;

  art.appendChild(thumb);
  art.appendChild(body);
  art.appendChild(more);

  art.addEventListener('click', () => showDetails(it));
  return art;
}

// ===== عرض التفاصيل بالمودال =====
function showDetails(it){
  $('mTitle').textContent = it.title || '';
  $('mMeta').textContent = `${it.source || ''} — ${fmtDate(it.published)}`;

  $('mEn').textContent = it.summary_en || 'No English summary.';
  $('mAr').textContent = it.summary_ar || 'لا يوجد ملخص عربي.';

  let cve = '';
  if (it.cves && it.cves.length) cve += `CVE: ${escapeHTML(it.cves.join(', '))}`;
  if (it.cvss) cve += (cve?', ':'') + `CVSS: ${escapeHTML(String(it.cvss))}`;
  if (it.affected && it.affected.length) cve += (cve?', ':'') + `Affected: ${escapeHTML(it.affected.join('; '))}`;
  $('mCv').innerHTML = cve ? cve : '';

  $('mAction').innerHTML = it.action ? `الإجراء الموصى به: ${escapeHTML(it.action)}` : '';

  const srcs = (it.sources && it.sources.length ? it.sources : (it.link?[it.link]:[]));
  $('mSources').innerHTML = srcs.length
    ? `المصادر: ${srcs.map(u=>`<a target="_blank" rel="noopener" href="${u}">${escapeHTML(new URL(u).hostname)}</a>`).join(' · ')}`
    : '';

  openModal();
}

// ===== رندر الشبكة =====
function render(){
  const grid = $('newsGrid');
  grid.innerHTML = '';
  const list = FILTERED.slice(0, visibleCount);
  for (const it of list) grid.appendChild(card(it));

  $('loadMoreBtn').disabled = (visibleCount >= FILTERED.length);
}

// ===== فلترة بالبحث =====
function applySearch(){
  const q = ($('searchInput').value || '').trim().toLowerCase();
  visibleCount = PAGE_SIZE;
  FILTERED = ALL.filter(it => {
    const hay =
      `${it.title} ${it.summary_ar||''} ${it.summary_en||''} ${(it.cves||[]).join(' ')} ${(it.affected||[]).join(' ')}`.toLowerCase();
    return !q || hay.includes(q);
  });
  render();
}

// ===== التصنيفات =====
function buildCategories(){
  const cats = Array.from(new Set(ALL.map(x=>x.category).filter(Boolean))).sort();
  const wrap = $('cats');
  wrap.innerHTML = `<button class="badge" onclick="filterByCategory('')">الكل</button>` +
    cats.map(c => `<button class="badge" onclick="filterByCategory('${escapeHTML(c)}')">${escapeHTML(c)}</button>`).join('');
}

function filterByCategory(cat){
  const q = ($('searchInput').value || '').trim().toLowerCase();
  visibleCount = PAGE_SIZE;
  FILTERED = ALL.filter(it =>
    (!cat || (it.category||'').toLowerCase() === cat.toLowerCase()) &&
    (!q || (
      `${it.title} ${it.summary_ar||''} ${it.summary_en||''} ${(it.cves||[]).join(' ')} ${(it.affected||[]).join(' ')}`.toLowerCase().includes(q)
    ))
  );
  render();
}

// ===== تحميل البيانات =====
async function loadNews(){
  let url = NEWS_URL;
  let data = [];
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('news.json not found');
    data = await res.json();
  }catch(e){
    console.error('Failed to load news.json', e);
    data = [];
  }

  // تأكد من مصفوفة سليمة
  if(!Array.isArray(data)) data = [];

  // رتب حسب التاريخ تنازلي
  data.sort((a,b)=> String(b.published||'').localeCompare(String(a.published||'')));

  ALL = data;
  FILTERED = data;
  buildCategories();
  render();
}

// ===== تهيئة =====
function init(){
  $('mClose').addEventListener('click', closeModal);
  $('loadMoreBtn').addEventListener('click', ()=>{
    visibleCount += PAGE_SIZE;
    render();
  });
  $('searchInput').addEventListener('input', ()=>{
    // مهلة صغيرة لنعومة الكتابة
    if (window.__qto) clearTimeout(window.__qto);
    window.__qto = setTimeout(applySearch, 150);
  });

  loadNews();
}

document.addEventListener('DOMContentLoaded', init);
