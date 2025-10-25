/* eslint-disable */
const PAGE_SIZE = 12;

const els = {
  grid: document.getElementById('newsGrid'),
  search: document.getElementById('searchBox'),
  filters: document.getElementById('filters'),
  loadMore: document.getElementById('loadMoreBtn'),
  modal: document.getElementById('newsModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalMeta: document.getElementById('modalMeta'),
  modalAr: document.getElementById('modalAr'),
  modalEn: document.getElementById('modalEn'),
  modalSrc: document.getElementById('modalSrc'),
  modalClose: document.getElementById('modalClose')
};

let allNews = [];
let viewNews = [];
let page = 0;
let activeCategory = 'All';
let q = '';

function fmtDate(iso) {
  try {
    return new Date(iso).toISOString().replace('T', ' ').replace('Z','Z');
  } catch { return iso || ''; }
}

function badge(text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  return span;
}

function clearGrid() {
  els.grid.innerHTML = '';
  page = 0;
}

function applyFilter() {
  q = (els.search.value || '').trim().toLowerCase();
  viewNews = allNews.filter(item => {
    const matchText =
      item.title.toLowerCase().includes(q) ||
      (item.summary_en||'').toLowerCase().includes(q) ||
      (item.summary_ar||'').toLowerCase().includes(q) ||
      (item.cves||[]).join(' ').toLowerCase().includes(q);
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchText && matchCat;
  });
  clearGrid();
  renderPage();
}

function renderPage() {
  const start = page * PAGE_SIZE;
  const slice = viewNews.slice(start, start + PAGE_SIZE);
  slice.forEach(addCard);
  page++;
  els.loadMore.style.display = (page * PAGE_SIZE < viewNews.length) ? 'inline-flex' : 'none';
}

function addCard(item) {
  const card = document.createElement('article');
  card.className = 'news-card';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  const img = (item.image || '').trim();
  if (img) {
    thumb.style.backgroundImage = `url('${img.replace(/'/g,"%27")}')`;
    thumb.style.backgroundSize = "cover";
    thumb.style.backgroundPosition = "center";
  } else {
    thumb.style.background = "radial-gradient(120px at 30% 30%, #1e6c77, #0c2730)";
  }
  card.appendChild(thumb);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${item.source} — ${fmtDate(item.published)}`;
  card.appendChild(meta);

  const h3 = document.createElement('h3');
  const a = document.createElement('a');
  a.href = "#";
  a.textContent = item.title;
  a.addEventListener('click', e => {
    e.preventDefault();
    openModal(item);
  });
  h3.appendChild(a);
  card.appendChild(h3);

  const cat = badge(item.category || 'General');
  card.appendChild(cat);

  els.grid.appendChild(card);
}

function openModal(item) {
  els.modalTitle.textContent = item.title;
  els.modalMeta.textContent = `${item.source} — ${fmtDate(item.published)}`;
  els.modalAr.textContent = item.summary_ar || 'لا يوجد ملخص عربي.';
  els.modalEn.textContent = item.summary_en || 'No English summary.';
  // مصادر متعددة لنفس الخبر
  const srcs = (item.sources && item.sources.length) ? item.sources : [item.link];
  els.modalSrc.innerHTML = '';
  srcs.slice(0,5).forEach((u,i)=>{
    const link = document.createElement('a');
    link.href = u;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = i===0 ? 'المصدر' : `المصدر ${i+1}`;
    els.modalSrc.appendChild(link);
    if (i < srcs.length-1) els.modalSrc.appendChild(document.createTextNode(' · '));
  });
  els.modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  els.modal.classList.remove('show');
  document.body.style.overflow = '';
}

els.modalClose?.addEventListener('click', closeModal);
els.modal?.addEventListener('click', (e)=>{ if(e.target === els.modal) closeModal(); });

function drawFilters() {
  const cats = ['All','Patch/Update','Data Breach','Vulnerability','Threat/Attack','Policy/Advisory','General'];
  els.filters.innerHTML = '';
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (activeCategory===c ? ' active':'');
    btn.textContent = c;
    btn.addEventListener('click', ()=>{
      activeCategory = c;
      document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
    els.filters.appendChild(btn);
  });
}

async function loadNews() {
  try {
    const res = await fetch('./news.json?v=' + Date.now());
    if (!res.ok) throw new Error('news.json not found');
    const data = await res.json();
    // تأكد من وجود الحقول
    allNews = (data || []).map(x => ({
      id: x.id,
      title: x.title,
      link: x.link,
      published: x.published,
      source: x.source,
      summary_en: x.summary_en || '',
      summary_ar: x.summary_ar || '',
      category: x.category || 'General',
      image: x.image || '',
      cves: x.cves || [],
      sources: x.sources || []
    }));
    // ترتيب تنازلي
    allNews.sort((a,b)=> new Date(b.published) - new Date(a.published));
    viewNews = [...allNews];
    drawFilters();
    renderPage();
  } catch (e) {
    console.error('Failed loading news:', e);
    els.grid.innerHTML = '<p class="error">لا يمكن تحميل الأخبار الآن.</p>';
  }
}

// Events
els.search?.addEventListener('input', ()=> {
  // تأخير بسيط
  clearTimeout(els._t);
  els._t = setTimeout(applyFilter, 200);
});
els.loadMore?.addEventListener('click', renderPage);

// Init
document.addEventListener('DOMContentLoaded', loadNews);
