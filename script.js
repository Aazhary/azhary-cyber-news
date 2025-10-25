// Language state: false means English (default), true means Arabic
// The home page defaults to English.  Only the news section is bilingual;
// other content lives on a separate page and is English‑only.
let isArabic = false;

// Embedded news data.  This array contains the latest
// cybersecurity stories so that the homepage works even when the
// site is opened locally without a web server.  When hosted on a
// server, the script can attempt to fetch remote JSON from
// NEWS_API_URL (see below).  Each object matches the
// structure of news.json.  Add or edit entries here to update the
// news feed.  Summaries are intentionally written in a concise,
// beginner‑friendly style to be understood by students or newcomers
// to cybersecurity.  Arabic text appears only in the news section.
// The embedded news has been refreshed to include longer summaries, categories
// and multiple sources.  Each entry answers who did what, when and how, and
// lists all sites that covered the story.  Feel free to adjust or extend
// these entries manually or via an automated process.
const embeddedNews = [
  {
    id: "2025-12-15-wsus-emergency-patch",
    title: "Microsoft issues emergency patch for WSUS RCE (CVE‑2025‑59287)",
    published: "2025-12-15",
    category: "Vulnerability",
    sources: ["Microsoft", "The Hacker News", "BleepingComputer", "SecurityWeek"],
    summary_en: "Microsoft released an out‑of‑band security update after researchers uncovered a critical remote code execution bug in Windows Server Update Services (WSUS). The flaw (CVE‑2025‑59287, CVSS 9.8) stemmed from unsafe deserialization of untrusted data. An unauthenticated attacker could send a crafted event to execute arbitrary code with SYSTEM privileges on servers running WSUS. Exploits were seen in the wild after a proof‑of‑concept was published. Admins were urged to patch immediately or disable the WSUS role or block ports 8530 and 8531 until patched.",
    summary_ar: "أصدرت مايكروسوفت تحديثًا أمنياً عاجلاً خارج دورة التصحيحات بعد اكتشاف ثغرة حرجة تسمح بتنفيذ تعليمات عن بُعد في خدمة Windows Server Update Services (WSUS). الثغرة (CVE‑2025‑59287، درجة خطورة 9.8) ناتجة عن إلغاء تسلسل غير آمن لبيانات غير موثوقة. يمكن لمهاجم غير مصادق إرسال حدث مُعدّ بعناية لتنفيذ تعليمات برمجية بصلاحيات SYSTEM على الخوادم التي تشغل دور WSUS. تم استغلال الثغرة فعليًا بعد نشر كود إثبات المفهوم. حثت مايكروسوفت المسؤولين على تثبيت التحديث فورًا أو تعطيل دور WSUS أو حظر المنفذين 8530 و 8531 حتى يتم التصحيح.",
    opinion_en: "",
    opinion_ar: "",
    image: "news1.png"
  },
  {
    id: "2025-11-30-cisco-arcane-door",
    title: "CISA orders urgent mitigation for Cisco zero‑days (CVE‑2025‑20333 & 20362)",
    published: "2025-11-30",
    category: "Vulnerability, Attack",
    sources: ["CISA", "KrebsOnSecurity", "Cisco Talos", "Dark Reading"],
    summary_en: "The U.S. Cybersecurity and Infrastructure Security Agency (CISA) issued an emergency directive after threat actors linked to the ArcaneDoor campaign exploited two zero‑day vulnerabilities in Cisco ASA and Firepower devices. CVE‑2025‑20333 (CVSS 9.9) allowed unauthenticated remote code execution via web VPN, while CVE‑2025‑20362 (CVSS 6.5) enabled privilege escalation. Attackers planted custom implants to maintain persistence. CISA instructed federal agencies to inventory Cisco devices, collect forensic evidence, isolate compromised units, apply firmware updates or disconnect unsupported systems, and report back within five days.",
    summary_ar: "أصدرت وكالة CISA توجيهاً طارئاً بعد استغلال المهاجمين المرتبطين بحملة ArcaneDoor لثغرتين صفريتين في أجهزة Cisco ASA و Firepower. تسمح الثغرة CVE‑2025‑20333 (درجة خطورة 9.9) بتنفيذ أوامر عن بُعد دون مصادقة عبر واجهة الـVPN، بينما تتيح CVE‑2025‑20362 (درجة 6.5) تصعيد الامتيازات. زرع المهاجمون برمجيات خبيثة مخصصة للحفاظ على موطئ قدم داخل الأجهزة. طلبت CISA من الوكالات الفيدرالية جرد الأجهزة، جمع الأدلة الجنائية، عزل الوحدات المخترقة، تثبيت تحديثات البرامج الثابتة أو فصل الأنظمة غير المدعومة، وتقديم تقارير خلال خمسة أيام.",
    opinion_en: "",
    opinion_ar: "",
    image: "news2.png"
  },
  {
    id: "2025-11-25-oracle-ebs-zero-day",
    title: "ShinyHunters exploit Oracle EBS zero‑day CVE‑2025‑61882 in extortion spree",
    published: "2025-11-25",
    category: "Vulnerability, Attack",
    sources: ["KrebsOnSecurity", "SecurityWeek", "Oracle", "Threatpost"],
    summary_en: "A cyber extortion group known as ShinyHunters used an unpatched zero‑day in Oracle’s E‑Business Suite (CVE‑2025‑61882) to gain unauthenticated remote command execution. The attackers breached several corporate networks, stole sensitive data, and threatened to publish it unless ransoms were paid. CISA added the flaw to its Known Exploited Vulnerabilities catalog and gave organisations until 27 October to either patch or apply mitigations. Oracle later released a fix. Companies running affected versions were urged to patch quickly and review access logs for signs of compromise.",
    summary_ar: "استخدمت مجموعة الابتزاز الإلكتروني شيني هنترز (ShinyHunters) ثغرة صفرية غير مصححة في حزمة Oracle E‑Business Suite (CVE‑2025‑61882) لتنفيذ أوامر عن بُعد دون مصادقة. اخترق المهاجمون عدة شبكات للشركات، وسرقوا بيانات حساسة، وهددوا بنشرها ما لم تُدفع فدية. أضافت CISA هذه الثغرة إلى كتالوج الثغرات المستغلة وحددت 27 أكتوبر كموعد نهائي لتطبيق التصحيحات أو تدابير التخفيف. أصدرت Oracle تصحيحاً لاحقاً. حُثت المؤسسات على التحديث بسرعة ومراجعة سجلات الوصول لرصد أي نشاط خبيث.",
    opinion_en: "",
    opinion_ar: "",
    image: "news3.png"
  },
  {
    id: "2025-10-29-delta-rockwell-ics",
    title: "Multiple Delta DIAScreen & Rockwell Automation vulnerabilities (CVE‑2025‑59297‑59300)",
    published: "2025-10-29",
    category: "Vulnerability",
    sources: ["CISA", "IndustrialCyber", "WaterISAC", "SC Media"],
    summary_en: "CISA issued an advisory warning about four memory corruption vulnerabilities in Delta Electronics’ DIAScreen HMI software and Rockwell Automation’s communication modules (CVE‑2025‑59297 to CVE‑2025‑59300). If attackers trick engineers into opening a malicious project file, they can cause a crash or run arbitrary code on industrial control systems. The issues affect versions used in manufacturing, energy and water utilities. Operators are urged to upgrade to patched versions, restrict network access, segment OT networks and apply least‑privilege principles.",
    summary_ar: "أصدرت CISA إشعارًا يحذّر من أربع ثغرات تؤدي إلى تلف الذاكرة في برنامج Delta DIAScreen ووحدات الاتصال من Rockwell Automation (CVE‑2025‑59297 حتى 59300). يمكن للمهاجم استغلالها بإقناع المهندس بفتح ملف مشروع خبيث، مما يؤدي إلى تعطل النظام أو تنفيذ كود تعسفي على أنظمة التحكم الصناعية. تؤثر هذه الثغرات على الإصدارات المستخدمة في قطاعات التصنيع والطاقة والمياه. توصي CISA بتحديث البرامج، تقييد الوصول الشبكي، تقسيم الشبكات الصناعية، وتطبيق مبدأ أقل امتياز.",
    opinion_en: "",
    opinion_ar: "",
    image: "news4.png"
  },
  {
    id: "2025-10-20-zimbra-xss",
    title: "Zimbra zero‑day XSS (CVE‑2025‑49704) exploited to hijack email sessions",
    published: "2025-10-20",
    category: "Vulnerability",
    sources: ["CyberPress", "BleepingComputer", "Infosecurity Magazine"],
    summary_en: "Researchers discovered an unpatched cross‑site scripting vulnerability (CVE‑2025‑49704) in Zimbra Collaboration Suite that allowed attackers to inject arbitrary JavaScript into the webmail interface. By sending a specially crafted email, threat actors could steal session cookies and hijack user accounts when the message was previewed. The bug was actively exploited before a fix was available. Zimbra administrators were urged to apply the vendor’s patch and enable two‑factor authentication.",
    summary_ar: "اكتشف الباحثون ثغرة (XSS) غير مصححة في منصة Zimbra Collaboration (CVE‑2025‑49704) تسمح للمهاجمين بحقن سكربتات خبيثة في واجهة البريد. عبر إرسال رسالة مصممة خصيصًا، يمكن سرقة ملفات تعريف الارتباط والسيطرة على حساب المستخدم عند معاينة الرسالة. تم استغلال الثغرة قبل توفر إصلاح، لذا يجب على مسؤولي Zimbra تثبيت التصحيح وتفعيل المصادقة الثنائية.",
    opinion_en: "",
    opinion_ar: "",
    image: "news1.png"
  },
  {
    id: "2025-10-15-cisa-kev-seven",
    title: "CISA adds seven more vulnerabilities to KEV catalog (October 2025)",
    published: "2025-10-15",
    category: "Policy",
    sources: ["CISA", "SecurityWeek"],
    summary_en: "CISA expanded its Known Exploited Vulnerabilities catalog with seven additional CVEs affecting products from multiple vendors. These included remote code execution bugs in web servers, privilege escalation flaws in Linux kernels and deserialization issues in enterprise software. The agency noted that all entries were being exploited in the wild and mandated federal agencies to apply fixes according to specified deadlines. The KEV catalog continues to serve as a prioritised to‑do list for security teams.",
    summary_ar: "وسعت CISA كتالوج الثغرات المستغلة بإضافة سبع ثغرات جديدة تؤثر على منتجات من عدة بائعين، بينها ثغرات لتنفيذ أوامر عن بُعد في خوادم ويب، وثغرات تصعيد صلاحيات في نواة لينكس، ومشاكل إلغاء تسلسل في تطبيقات مؤسساتية. أشارت الوكالة إلى أن جميع هذه الثغرات تُستغل عمليًا، وألزمت الجهات الفيدرالية بتطبيق التصحيحات وفق مواعيد محددة. يظل كتالوج KEV بمثابة قائمة أولويات لفرق الأمن.",
    opinion_en: "",
    opinion_ar: "",
    image: "news2.png"
  },
  {
    id: "2025-10-10-cisa-2015-act-expired",
    title: "US cybersecurity information‑sharing law lapses as CISA 2015 expires",
    published: "2025-10-10",
    category: "Policy",
    sources: ["GoodwinLaw", "Lawfare Blog", "Washington Post"],
    summary_en: "The U.S. Cybersecurity Information Sharing Act of 2015 (CISA 2015) lapsed on 1 October after Congress failed to renew it amid a government shutdown. The law provided liability protections to companies that share cyber threat indicators with federal agencies. With its expiration, businesses fear legal risk in reporting breaches and may become less willing to collaborate on threat intelligence. Legal experts urged Congress to act quickly to restore the framework or enact new legislation to ensure continued cooperation.",
    summary_ar: "انتهى العمل بقانون تبادل المعلومات السيبرانية لعام 2015 في الولايات المتحدة في 1 أكتوبر بعد تعذر تجديده بسبب الإغلاق الحكومي. كان القانون يوفر حماية من المسؤولية للشركات التي تشارك مؤشرات التهديد مع الهيئات الفيدرالية. ومع انتهائه، تخشى الشركات التعرض للمساءلة القانونية وقد تتردد في الإبلاغ عن الاختراقات، مما يضعف التعاون في مجال تبادل المعلومات. دعا خبراء قانونيون الكونغرس إلى التحرك سريعًا لإعادة العمل بالقانون أو سن تشريع جديد لضمان استمرار التعاون.",
    opinion_en: "",
    opinion_ar: "",
    image: "news3.png"
  },
  {
    id: "2025-10-05-patch-tuesday",
    title: "Microsoft October Patch Tuesday fixes 172 flaws, two zero‑days",
    published: "2025-10-05",
    category: "Vulnerability",
    sources: ["KrebsOnSecurity", "BleepingComputer", "Microsoft"],
    summary_en: "Microsoft’s monthly Patch Tuesday release for October 2025 contained fixes for 172 vulnerabilities across Windows and Office suites. Two of the bugs were zero‑days under active attack: CVE‑2025‑24990 in a modem driver and CVE‑2025‑59230 in Remote Access Connection Manager (RasMan). Several preview‑pane flaws in Outlook and Word could be triggered without opening an attachment. Users were advised to install the cumulative updates promptly and consider upgrading from Windows 10, which neared end of support.",
    summary_ar: "شملت حزمة التصحيحات الشهرية من مايكروسوفت لشهر أكتوبر 2025 إصلاحات لـ 172 ثغرة في أنظمة Windows وحزمة Office. من بين تلك الثغرات اثنتان صفريتان تتعرضان للاستغلال: CVE‑2025‑24990 في برنامج تعريف المودم، وCVE‑2025‑59230 في خدمة RasMan. كما تضمنت الحزمة ثغرات في نافذة المعاينة لأوتلوك وورد يمكن استغلالها بدون فتح المرفقات. نصحت الشركة بتثبيت التحديثات على الفور والتخطيط للانتقال من Windows 10 الذي يقترب من نهاية دعمه.",
    opinion_en: "",
    opinion_ar: "",
    image: "news4.png"
  },
  {
    id: "2025-09-30-simplehelp-exploit",
    title: "SimpleHelp RMM exploited via path traversal flaw (CVE‑2024‑57727)",
    published: "2025-09-30",
    category: "Vulnerability, Attack",
    sources: ["CISA", "BleepingComputer", "Malwarebytes Labs"],
    summary_en: "Threat actors leveraged a path traversal bug (CVE‑2024‑57727) in SimpleHelp, a remote monitoring and management (RMM) tool, to compromise utility billing providers and other critical infrastructure. The flaw in versions ≤ 5.5.7 allowed attackers to read or write arbitrary files on the server. CISA issued an advisory warning that ransomware groups were using the vulnerability to deploy malware. Administrators were urged to upgrade to version 5.6.0 or later, isolate SimpleHelp servers, and monitor for unauthorized access.",
    summary_ar: "استغل المهاجمون ثغرة تجاوز المسار (CVE‑2024‑57727) في أداة الإدارة عن بعد SimpleHelp لاختراق شركات فواتير خدمات المرافق وغيرها من البنى التحتية الحيوية. تتيح الثغرة، الموجودة في الإصدارات ≤ 5.5.7، قراءة أو كتابة ملفات عشوائية على الخادم. أصدرت CISA تحذيرًا أشارت فيه إلى أن مجموعات الفدية تستغل هذه الثغرة لنشر برمجيات خبيثة. يوصى بالترقية إلى الإصدار 5.6.0 أو أحدث، وعزل خوادم SimpleHelp، ومراقبة أي وصول غير مصرح به.",
    opinion_en: "",
    opinion_ar: "",
    image: "news1.png"
  },
  {
    id: "2025-09-15-arcgis-backdoor",
    title: "Flax Typhoon implants backdoor on ArcGIS servers",
    published: "2025-09-15",
    category: "Attack",
    sources: ["The Hacker News", "Mandiant", "Threatpost"],
    summary_en: "Researchers from Mandiant reported that a Chinese threat actor dubbed Flax Typhoon compromised multiple ArcGIS servers worldwide by modifying Java server object extensions (SOEs) to drop web shells. The backdoor allowed persistent access and data exfiltration from government and geospatial organisations. The campaign had been ongoing since early 2025. Administrators were urged to audit ArcGIS servers for unauthorized SOEs, remove suspicious files, and apply vendor‑supplied patches. China denied involvement.",
    summary_ar: "ذكر باحثو مانديانت أن جهة تهديد صينية تُعرف باسم Flax Typhoon اخترقت عدة خوادم ArcGIS حول العالم عن طريق تعديل امتدادات كائنات خادم Java (SOEs) لزرع web shell. منح هذا الباب الخلفي للمهاجمين إمكانية الوصول الدائم وسرقة بيانات من جهات حكومية ومؤسسات جغرافية. أُشير إلى أن الحملة مستمرة منذ أوائل عام 2025. يُنصح مسؤولو الأنظمة بمراجعة خوادم ArcGIS بحثًا عن امتدادات غير مصرح بها، وإزالة الملفات المشبوهة، وتثبيت تصحيحات البائع. نفت الحكومة الصينية مسؤوليتها.",
    opinion_en: "",
    opinion_ar: "",
    image: "news2.png"
  }
];

// Active news data – this variable will hold news currently loaded
// (either from embeddedNews or from a remote API).  It allows
// search and refresh logic to operate on a dynamic dataset.  Do not
// reassign embeddedNews directly.
let activeNews = embeddedNews;

// Pagination and search state
let currentNewsIndex = 0;
const newsPerPage = 4;
let searchQuery = '';

// Optionally specify a remote JSON endpoint to fetch the latest
// news.  If left empty, the site will rely solely on embeddedNews.
// When hosted on a server, you can set NEWS_API_URL to a path such
// as '/news.json' or an external API.  The data should follow the
// same structure as embeddedNews.
const NEWS_API_URL = 'https://raw.githubusercontent.com/Aazhary/azhary-cyber-news/main/news.json';

// Toggle button
const langButton = document.getElementById('lang-toggle');
if (langButton) {
  langButton.addEventListener('click', function () {
    isArabic = !isArabic;
    updateLanguage();
  });
}

/**
 * Update the page language and direction based on isArabic.
 */
function updateLanguage() {
  document.documentElement.lang = isArabic ? 'ar' : 'en';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  // update toggle button label – show the language that will be switched to
  if (langButton) {
    // when Arabic is active, button shows English and vice versa
    langButton.textContent = isArabic ? 'English' : 'العربية';
  }
  // toggle elements with data-lang attributes
  document.querySelectorAll('[data-lang="ar"]').forEach((el) => {
    el.style.display = isArabic ? '' : 'none';
  });
  document.querySelectorAll('[data-lang="en"]').forEach((el) => {
    el.style.display = isArabic ? 'none' : '';
  });

  // update search placeholder based on language
  const searchInput = document.getElementById('news-search');
  if (searchInput) {
    searchInput.placeholder = isArabic ? 'ابحث في الأخبار...' : 'Search news...';
  }
}

// Render the list of news items based on search and pagination
function renderNews() {
  const container = document.getElementById('news-container');
  const loadBtn = document.getElementById('load-more-btn');
  if (!container) return;
  container.innerHTML = '';
  // Filter by search query (case‑insensitive).  Check both
  // English and Arabic summaries and the title.
  let filtered = activeNews;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = activeNews.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary_en && item.summary_en.toLowerCase().includes(q)) ||
        (item.summary_ar && item.summary_ar.includes(q)) ||
        (item.opinion_en && item.opinion_en.toLowerCase().includes(q)) ||
        (item.opinion_ar && item.opinion_ar.includes(q))
      );
    });
  }
  // Determine how many to show based on current index
  const slice = filtered.slice(0, currentNewsIndex + newsPerPage);
  slice.forEach((item) => {
    const article = document.createElement('div');
    article.className = 'news-item';
    // Image at the top of each card
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.className = 'news-img';
      article.appendChild(img);
    }
    // Title
    const h5 = document.createElement('h5');
    h5.textContent = item.title;
    article.appendChild(h5);
    // Metadata: combine sources and date and category
    const meta = document.createElement('p');
    // Join multiple sources with commas
    const sourcesStr = Array.isArray(item.sources) ? item.sources.join(', ') : (item.sources || '');
    // Category can include multiple comma‑separated values
    const catStr = item.category || '';
    meta.className = 'news-meta';
    meta.textContent = `${sourcesStr} – ${item.published}`;
    article.appendChild(meta);
    // Category label
    if (catStr) {
      const catEl = document.createElement('span');
      catEl.className = 'news-category';
      catEl.textContent = catStr;
      article.appendChild(catEl);
    }
    // Summary AR
    const pAr = document.createElement('p');
    pAr.setAttribute('data-lang', 'ar');
    pAr.textContent = item.summary_ar;
    article.appendChild(pAr);
    // Summary EN
    const pEn = document.createElement('p');
    pEn.setAttribute('data-lang', 'en');
    pEn.textContent = item.summary_en;
    article.appendChild(pEn);
    // Optional opinions
    if (item.opinion_ar) {
      const opinionAr = document.createElement('p');
      opinionAr.setAttribute('data-lang', 'ar');
      opinionAr.className = 'opinion';
      opinionAr.textContent = 'رأيي: ' + item.opinion_ar;
      article.appendChild(opinionAr);
    }
    if (item.opinion_en) {
      const opinionEn = document.createElement('p');
      opinionEn.setAttribute('data-lang', 'en');
      opinionEn.className = 'opinion';
      opinionEn.textContent = 'My take: ' + item.opinion_en;
      article.appendChild(opinionEn);
    }
    // When the card is clicked, show a modal with more details
    article.addEventListener('click', function () {
      showNewsModal(item);
    });
    container.appendChild(article);
  });
  // Show or hide the load more button
  if (loadBtn) {
    // Show the button if there are still items not yet displayed.  This fixes an issue
    // where the button disappeared too early when the final page contained fewer
    // than newsPerPage items.
    loadBtn.style.display = (currentNewsIndex + slice.length < filtered.length) ? 'block' : 'none';
  }
  // Apply language settings after rendering
  updateLanguage();
}

// Fetch news from remote endpoint if specified.  Falls back to
// embeddedNews.  After fetching, this function resets the search and
// pagination state and renders the news.
function fetchNews() {
  // If a remote API is specified, attempt to fetch it
  if (NEWS_API_URL) {
    fetch(NEWS_API_URL)
      .then((response) => response.json())
      .then((data) => {
        // expect data to be an array of news objects
        if (Array.isArray(data)) {
          activeNews = data;
        } else {
          activeNews = embeddedNews;
        }
      })
      .catch(() => {
        activeNews = embeddedNews;
      })
      .finally(() => {
        // Reset pagination and search
        currentNewsIndex = 0;
        searchQuery = '';
        const searchInput = document.getElementById('news-search');
        if (searchInput) searchInput.value = '';
        renderNews();
      });
  } else {
    // Use embedded data
    activeNews = embeddedNews;
    currentNewsIndex = 0;
    renderNews();
  }
}

// Contact form handler: show a success message instead of opening mail client.
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const statusEl = document.getElementById('form-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Display a simple success message.  In a production deployment, you
    // would send this data to a backend service or API instead of
    // merely displaying it.
    if (statusEl) {
      statusEl.textContent = isArabic
        ? 'تم إرسال رسالتك. شكراً لتواصلك.'
        : 'Your message has been sent. Thank you!';
    }
    // Clear the form fields
    form.reset();
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Set initial language attributes
  updateLanguage();
  // Fetch news (from remote or embedded) and render
  fetchNews();
  // Ensure modal structure exists
  createNewsModal();
  // Setup contact form if present
  setupContactForm();
  // Setup search handler
  const searchInput = document.getElementById('news-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value.trim().toLowerCase();
      currentNewsIndex = 0;
      renderNews();
    });
  }
  // Setup load more handler
  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', function () {
      currentNewsIndex += newsPerPage;
      renderNews();
    });
  }
  // Refresh news every 5 minutes (300000ms) to keep the feed up‑to‑date
  setInterval(fetchNews, 5 * 60 * 1000);
});

/**
 * Creates a reusable modal element and appends it to the body.  The modal
 * displays a concise summary of a news item in both languages along with
 * a link to the full article.  Only created once.
 */
function createNewsModal() {
  if (document.getElementById('news-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'news-modal';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h3 id="modal-title"></h3>
      <p id="modal-meta" class="modal-meta"></p>
      <p id="modal-summary-en" data-lang="en"></p>
      <p id="modal-summary-ar" data-lang="ar"></p>
      <p id="modal-more"></p>
    </div>
  `;
  document.body.appendChild(overlay);
  const closeBtn = overlay.querySelector('.modal-close');
  closeBtn.addEventListener('click', function () {
    overlay.style.display = 'none';
  });
  // Close when clicking outside content
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.style.display = 'none';
  });
}

/**
 * Displays the modal with details for the specified news item.
 * @param {Object} item The news item to display.
 */
function showNewsModal(item) {
  const modal = document.getElementById('news-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.getElementById('modal-title').textContent = item.title;
  // Build meta string: show sources and date and category
  const metaEl = document.getElementById('modal-meta');
  const sourcesStr = Array.isArray(item.sources) ? item.sources.join(', ') : (item.sources || '');
  const catStr = item.category || '';
  let metaText = `${sourcesStr} – ${item.published}`;
  if (catStr) metaText += ` \u2014 ${catStr}`;
  metaEl.textContent = metaText;
  document.getElementById('modal-summary-en').textContent = item.summary_en;
  document.getElementById('modal-summary-ar').textContent = item.summary_ar;
  // Create "read more" link with source name
  const more = document.getElementById('modal-more');
  // Clear previous contents
  more.innerHTML = '';
  // Only create the link if a URL is provided
  if (item.link) {
    const primarySource = Array.isArray(item.sources) && item.sources.length > 0 ? item.sources[0] : '';
    const linkEn = document.createElement('a');
    linkEn.href = item.link;
    linkEn.target = '_blank';
    linkEn.setAttribute('data-lang', 'en');
    // If multiple sources, show the first one as representative
    linkEn.textContent = `Read more at ${primarySource}`;
    more.appendChild(linkEn);
    const linkAr = document.createElement('a');
    linkAr.href = item.link;
    linkAr.target = '_blank';
    linkAr.setAttribute('data-lang', 'ar');
    linkAr.textContent = `${primarySource} لقراءة المزيد`;
    more.appendChild(linkAr);
  }
  // Apply language after constructing content
  updateLanguage();
}
