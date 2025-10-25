/* ====== إعداد مصدر البيانات ====== */
/* عدّل السطر التالي باسم حسابك والريبو */
const NEWS_API_URL =
  'https://raw.githubusercontent.com/Aazhary/azhary-cyber-news/main/news.json';

/* حجم الدُفعة المبدئيّة للعرض */
const PAGE_SIZE = 12;

/* حالة محليّة */
let ALL = [];          // كل الأخبار بعد التطبيع
let FILTERED = [];     // نتيجة البحث الحالي
let visibleCount = PAGE_SIZE;

/* مساعدات */
const $ = (id) => document.getElementById(id);
const escapeHTML = (s='') => s.replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* تطبيع الحقول لضمان وجود كل المفاتيح */
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

/* تحميل الأخبار من GitHub بدون كاش */
async function loadNews() {
  try {
    const url = `${NEWS_API_URL}?_=${Date.now()}`;   // cache-busting
    const res = await fetch(`${NEWS_API_URL}?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    ALL = normalizeNews(data).sort((a,b) => String(b.published).localeCompare(String(a.published)));
    FILTERED = ALL.slice();
    initUI();
  } catch (e) {
    console.error('[news load failed]', e);
    $('newsGrid').innerHTML =
      '<div class="error">تعذر تحميل الأخبار من <b>news.json</b>. تحقق من الرابط في <b>script.js</b>.</div>';
  }
}

/* تهيئة الواجهة: بحث + تحميل المزيد + إغلاق النافذة */
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
          it.title, it.summary_ar, it.summary_en,
          it.category, ...(it.categories||[]),
          ...(it.cves||[]), ...(it.sources||[])
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

  // modal close
  $('mClose').addEventListener('click', closeModal);
  $('modalWrap').addEventListener('click', (e) => {
    if (e.target.id === 'modalWrap') closeModal();
  });

  render();
}

/* رسم البطاقات */
function render() {
  const grid = $('newsGrid');
  grid.innerHTML = '';

  const slice = FILTERED.slice(0, visibleCount);
  for (const it of slice) {
    grid.appendChild(card(it));
  }

  $('loadMoreBtn').style.display =
    (FILTERED.length > visibleCount) ? 'block' : 'none';
}

/* إنشاء بطاقة خبر */
function card(it) {
  const el = document.createElement('article');
  el.className = 'news-card';
  el.innerHTML = `
    <div class="thumb" style="${it.img ? `background-image:url('${escapeHTML(it.img)}')` : ''}"></div>
    <div class="body">
      <div class="meta">
        <span>${escapeHTML(it.source)}</span> – <time>${escapeHTML(it.published)}</time>
      </div>
      <h3 style="margin:6px 0 4px;font-size:1.05rem;color:#85f">${escapeHTML(it.title)}</h3>
      ${it.category ? `<span class="badge">${escapeHTML(it.category)}</span>` : ''}
    </div>`;
  el.addEventListener('click', () => openModal(it));
  return el;
}

/* فتح نافذة التفاصيل: عربي + English + مصادر */
function openModal(it) {
  $('mTitle').textContent = it.title;
  $('mMeta').textContent = `${(it.cves||[]).join(' · ')} ${it.published ? '— '+it.published : ''}`;
  $('mAR').textContent = it.summary_ar || '—';
  $('mEN').textContent = it.summary_en || '—';

  const srcHtml = (it.sources && it.sources.length)
    ? `<p>المصادر: ${
        it.sources.map(s => `<a href="${s}" target="_blank" rel="noopener">المصدر</a>`).join(' · ')
      }</p>`
    : (it.link ? `<p><a href="${it.link}" target="_blank" rel="noopener">Read full story</a></p>` : '');

  $('mSrc').innerHTML = srcHtml;
  $('modalWrap').style.display = 'flex';
}
function closeModal(){ $('modalWrap').style.display = 'none'; }

/* ابدأ التحميل */
document.addEventListener('DOMContentLoaded', loadNews);
