# أعلى الملف
import re, urllib.parse, requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/127.0 Safari/537.36"
}

def find_og_image(url: str) -> str | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200 or "text/html" not in r.headers.get("Content-Type",""):
            return None
        soup = BeautifulSoup(r.text, "lxml")

        # 1) Open Graph / Twitter
        for sel, attr in [
            ('meta[property="og:image"]', "content"),
            ('meta[name="twitter:image"]', "content"),
            ('link[rel="image_src"]', "href"),
        ]:
            tag = soup.select_one(sel)
            if tag and tag.get(attr):
                return urllib.parse.urljoin(url, tag.get(attr).strip())

        # 2) أول صورة داخل المقال
        article = soup.find("article") or soup
        img = article.find("img", src=True)
        if img:
            return urllib.parse.urljoin(url, img["src"].strip())
    except Exception:
        return None
    return None

def to_proxy(img_url: str | None) -> str | None:
    if not img_url:
        return None
    # بعض المواقع تمنع الـ hotlink. استخدم وسيط خفيف (weserv)
    # احذف البروتوكول عشان الوسيط يشتغل
    clean = re.sub(r"^https?://", "", img_url)
    return f"https://images.weserv.nl/?url={urllib.parse.quote(clean, safe='')}&w=800&h=450&fit=cover"

# scripts/update_news.py
import json, re, time, hashlib, html
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse
import feedparser
import requests
from bs4 import BeautifulSoup

# -------- إعدادات --------
LAST_DAYS = 90
MAX_ITEMS = 400
FEEDS = [
    # صحافة ومصادر رسمية مختارة كبداية (زود لاحقاً)
    "https://feeds.feedburner.com/TheHackersNews",          # The Hacker News
    "https://www.bleepingcomputer.com/feed/",               # BleepingComputer
    "https://www.darkreading.com/rss.xml",                  # DarkReading
    "https://www.securityweek.com/feed/",                   # SecurityWeek
    "https://www.cisa.gov/news.xml",                        # CISA (أخبار/تنبيهات)
]

# -------- أدوات مساعدة --------
def norm_text(t):
    t = html.unescape(t or "")
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def extract_cves(text):
    return sorted(set(re.findall(r"CVE-\d{4}-\d{4,7}", text, flags=re.I)))

def simple_en_summary(title, text):
    text = norm_text(text)
    if len(text) > 600:
        text = text[:600].rsplit(" ", 1)[0] + "..."
    return f"{title}: {text}"

def simple_ar_summary(title, text):
    text = norm_text(text)
    # ترجمة سريعة جدًا بالمعنى (مكانها لاحقًا نموذج ترجمة)
    # هنا نكتب ملخص عربي مبسط بدون ترجمة آلية حرفية
    if len(text) > 420:
        text = text[:420].rsplit(" ", 1)[0] + "..."
    return f"{title} — ملخص: {text}"

def fetch_article_text(url, timeout=12):
    try:
        r = requests.get(url, timeout=timeout, headers={"User-Agent":"Mozilla/5.0"})
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        # محاولة عامة لاستخلاص المتن
        paras = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
        body = " ".join(paras)
        return body if len(body) > 100 else ""
    except:
        return ""

def domain(u):
    try:
        return urlparse(u).netloc
    except:
        return ""

def item_id(link, published):
    base = (link or "") + (published or "")
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]

def classify(text):
    text_low = text.lower()
    if any(k in text_low for k in ["cve-", "vulnerability", "patch", "zero-day", "rce", "privilege escalation"]):
        return "Vulnerability"
    if any(k in text_low for k in ["ransomware", "campaign", "apt", "phishing", "exploit", "breach"]):
        return "Threat/Attack"
    if any(k in text_low for k in ["policy", "directive", "advisory", "regulation", "sanction"]):
        return "Policy/Advisory"
    return "General"

# -------- جمع ومعالجة --------
cutoff = datetime.now(timezone.utc) - timedelta(days=LAST_DAYS)
collected = []

for feed in FEEDS:
    fp = feedparser.parse(feed)
    for e in fp.entries:
        # التاريخ
        pub = None
        if "published_parsed" in e and e.published_parsed:
            pub = datetime(*e.published_parsed[:6], tzinfo=timezone.utc)
        elif "updated_parsed" in e and e.updated_parsed:
            pub = datetime(*e.updated_parsed[:6], tzinfo=timezone.utc)
        else:
            pub = datetime.now(timezone.utc)

        if pub < cutoff:
            continue

        title = norm_text(getattr(e, "title", ""))
        link  = getattr(e, "link", "")
        desc  = norm_text(getattr(e, "summary", ""))
        if not desc or len(desc) < 120:
            body = fetch_article_text(link)
            if body:
                desc = body

        text_for_cve = f"{title}\n{desc}"
        cves = extract_cves(text_for_cve)

        # ملخصات
        summary_en = simple_en_summary(title, desc)
        summary_ar = simple_ar_summary(title, desc)

        item = {
            "id": item_id(link, pub.isoformat()),
            "title": title,
            "link": link,
            "published": pub.isoformat(),
            "source": domain(link),
            "summary_en": summary_en,
            "summary_ar": summary_ar,
            "cves": cves,
            "category": classify(text_for_cve),
            "sources": [link],  # سنملؤها عند الدمج
        }
        collected.append(item)

# -------- دمج المكرّر (حسب العنوان أو أول CVE) --------
def key_for_merge(it):
    if it["cves"]:
        return "CVE:" + it["cves"][0]
    # عنوان مُطبع للدمج
    k = re.sub(r"[^a-z0-9]+","", it["title"].lower())
    return "T:" + k

merged = {}
for it in collected:
    k = key_for_merge(it)
    if k not in merged:
        merged[k] = it
    else:
        # الأقدم/الأحدث
        if it["published"] < merged[k]["published"]:
            merged[k]["published"] = it["published"]
        # ضم الروابط
        merged[k]["sources"] = sorted(set(merged[k]["sources"] + [it["link"]]))
        # تجميع CVEs
        merged[k]["cves"] = sorted(set(merged[k]["cves"] + it["cves"]))

news = list(merged.values())
news.sort(key=lambda x: x["published"], reverse=True)
news = news[:MAX_ITEMS]

with open("news.json", "w", encoding="utf-8") as f:
    json.dump(news, f, ensure_ascii=False, indent=2)

print(f"Generated news.json with {len(news)} items.")
