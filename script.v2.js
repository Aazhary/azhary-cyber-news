/* ====== مصدر البيانات من الريبو (RAW) ====== */
const NEWS_API_URL =
  "https://raw.githubusercontent.com/Aazhary/azhary-cyber-news/main/news.json";

/* إعدادات عرض */
const PAGE_SIZE = 12;

/* حالة */
let ALL = [];
let FILTERED = [];
let visibleCount = PAGE_SIZE;

/* أدوات */
const $ = (id) => document.getElementById(id);
const escapeHTML = (s='') => s.replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* بديل SVG عند فشل الصور */
const FALLBACK_SVG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#0a2a33" offset="0"/>
        <stop stop-color="#113b46" offset="1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g fill="#6ff" font-family="Segoe UI,Roboto,Arial" font-size="28">
      <text x="32" y="70">Cybersecurity</text>
      <text x="32" y="112">news.azhary</text>
    </g>
  </svg>`);

/* اختيار صورة مناسبة */
function pickThumb(it){
  if (it.img && typeof it.img === 'string') return it.img;

  try{
    if (it.link){
      const host = new URL(it.link).hostname;
      // Google Favicons يرجع PNG ويشتغل كويس في InPrivate
      return `https://www.google.com/s2/favicons?domain=${host}&sz=256`;
    }
  }catch(e){/* ignore */}
  return FALLBACK_SVG;
}

/* تطبيع */
function normalizeNews(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x, i) => ({
    id: x.id || `item-${i}`,
    title: x.title || '',
    link: x.link || '',
    published: x.published || '',
    source: x.source || x.sources?.[0] || '',
    sources: Array.isArray(x.sources) ? x.sources : (x.source ? [x.source] : []),
    category: x.category || x.categories?.[0] || '',
    categories: Array.isArray(x.categories) ? x.categories : (x.category ? [x.category] : []),
    cves: Array.isArray(x.cves) ? x.cves : [],
    summary_ar: x.summary_ar || '',
    summary_en: x.summary_en || '',
    img: x.img || x.image || ''
  }));
}

/* تحميل الأخبار */
async function loadNews() {
  try {
    const res = await fetch(`${NEWS_API_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    ALL = normalizeNews(data).sort((a,b) =>
      String(b.published).localeCompare(String(a.published))
    );
    FILTERED = ALL.slice();

    initUI();
    console.log('NEWS items loaded:', ALL.length);
  } catch (e) {
    console.error('[news load failed]', e);
    $('newsGrid').innerHTML =
      '<div class="error">تعذر تحميل الأخبار من <b>news.json</b>. تأكد من الرابط داخل <b>script.v2.js</b>.</div>';
  }
}

/* تهيئة الواجهة */
function initUI() {
  const search = $('searchInput');
  const loadMore = $('loadMoreBtn');

  search.removeAttribute('disabled');

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    visibleCount = PAGE_SIZE;

    if (!q) {
      FILTERED = ALL.slice();
    } else {
      FILTERED = ALL.filter(it => {
        const hay = [
          it.title, it.summary_ar, it.summary_en, it.category,
          ...(it.categories||[]), ...(it.cves||[]), ...(it.sources||[])
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    render();
  });

  loadMore.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  $('mClose').addEventListener('click', closeModal);
  $('modalWrap').addEventListener('click', (e) => {
    if (e.target.id === 'modalWrap') closeModal();
  });

  render();
}

/* رسم */
function render() {
  const grid = $('newsGrid');
  grid.innerHTML = '';

  const slice = FILTERED.slice(0, visibleCount);
  slice.forEach(it => grid.appendChild(card(it)));

  $('loadMoreBtn').style.display =
    (FILTERED.length > visibleCount) ? 'block' : 'none';
}

/* بطاقة */
function card(it) {
  const el = document.createElement('article');
  el.className = 'news-card';

  const img = document.createElement('img');
  img.className = 'thumb';
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';
  img.src = pickThumb(it);
  img.onerror = () => { img.src = FALLBACK_SVG; };

  const body = document.createElement('div');
  body.className = 'body';
  body.innerHTML = `
    <div class="meta"><span>${escapeHTML(it.source)}</span> – <time>${escapeHTML(it.published)}</time></div>
    <h3>${escapeHTML(it.title)}</h3>
    ${it.category ? `<span class="badge">${escapeHTML(it.category)}</span>` : ''}
  `;

  el.appendChild(img);
  el.appendChild(body);
  el.addEventListener('click', () => openModal(it));
  return el;
}

/* نافذة التفاصيل */
function openModal(it) {
  $('mTitle').textContent = it.title;
  const metaBits = [];
  if (it.cves?.length) metaBits.push(it.cves.join(' · '));
  if (it.published) metaBits.push(it.published);
  $('mMeta').textContent = metaBits.join(' — ');

  $('mAR').textContent = it.summary_ar || '—';
  $('mEN').textContent = it.summary_en || '—';

  let srcHtml = '';
  if (it.sources?.length) {
    srcHtml = `<p>المصادر: ${
      it.sources.map(s => `<a href="${s}" target="_blank" rel="noopener">المصدر</a>`).join(' · ')
    }</p>`;
  } else if (it.link) {
    srcHtml = `<p><a href="${it.link}" target="_blank" rel="noopener">Read full story</a></p>`;
  }
  $('mSrc').innerHTML = srcHtml;

  $('modalWrap').style.display = 'flex';
}
function closeModal(){ $('modalWrap').style.display = 'none'; }

/* ابدأ */
document.addEventListener('DOMContentLoaded', loadNews);
