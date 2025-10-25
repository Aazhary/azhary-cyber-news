#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Update news.json from multiple cybersecurity sources, with:
- Arabic & English summaries answering: Who / What / When / How / Action
- Category classification
- CVE extraction
- og:image extraction
- De-duplication & source-merge
- Keep last 180 days only
"""

import json, re, os, hashlib, time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse
import requests, feedparser, tldextract
from bs4 import BeautifulSoup
from rapidfuzz import fuzz
from dateutil import parser as dtparser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS_JSON = os.path.join(ROOT, "news.json")

# ---------- Sources (RSS) ----------
SOURCES = [
    # News / Media
    "https://krebsonsecurity.com/feed/",
    "https://feeds.feedburner.com/TheHackersNews",
    "https://www.bleepingcomputer.com/feed/",
    "https://www.securityweek.com/feed/",
    "https://www.darkreading.com/rss.xml",
    "https://nakedsecurity.sophos.com/feed/",
    "https://www.csoonline.com/index.rss",
    "https://www.infosecurity-magazine.com/rss/news/",
    "https://www.theregister.com/security/headlines.atom",
    "https://www.zdnet.com/topic/security/rss.xml",
    "https://arstechnica.com/security/feed/",
    "https://www.scmagazine.com/home/security-news/feed",
    # Vendors / Research
    "https://blog.talosintelligence.com/feeds/posts/default",
    "https://msrc.microsoft.com/blog/feed/",
    "https://security.googleblog.com/feeds/posts/default",
    "https://www.crowdstrike.com/blog/feed/",
    "https://www.mandiant.com/resources/feed",
    "https://unit42.paloaltonetworks.com/feed/",
    "https://www.trendmicro.com/en_us/research.rss",
    "https://securelist.com/feed/",
    "https://www.eset.com/int/rss/blog/",
    "https://www.sentinelone.com/blog/feed/",
    "https://www.splunk.com/en_us/blog/_jcr_content.feed",
    "https://www.tenable.com/blog/rss.xml",
    "https://www.rapid7.com/blog/feed/",
    "https://www.qualys.com/feeds/qualys-blog.xml",
    # Gov / CERTs
    "https://www.cisa.gov/news-events/cybersecurity-advisories/all.xml",  # may redirect
    "https://www.cisa.gov/news-events/alerts/all.xml",
]

# ---------- Utilities ----------
UA = {"User-Agent": "Mozilla/5.0 (news-bot; +https://github.com/aazhary/azhary-cyber-news)"}
DAYS_WINDOW = 180
SIM_THRESHOLD = 86  # title similarity

def iso_now():
    return datetime.now(timezone.utc).isoformat()

def to_iso(s):
    if not s: return ""
    try:
        return dtparser.parse(s).astimezone(timezone.utc).isoformat()
    except Exception:
        return ""

def host_from_url(url):
    try:
        ext = tldextract.extract(url)
        return ".".join([p for p in [ext.domain, ext.suffix] if p])
    except Exception:
        return urlparse(url).netloc or ""

def sha_id(s):
    return hashlib.sha1(s.encode("utf-8", "ignore")).hexdigest()[:24]

def fetch_url(url, timeout=12):
    try:
        r = requests.get(url, timeout=timeout, headers=UA)
        if r.status_code == 200:
            return r.text
    except Exception:
        pass
    return ""

# ---------- NLP-ish helpers ----------
def extract_text_for_summary(html_or_text: str) -> str:
    if not html_or_text:
        return ""
    if "<" in html_or_text and "</" in html_or_text:
        soup = BeautifulSoup(html_or_text, "html.parser")
        for t in soup(["script","style","noscript"]): t.decompose()
        txt = " ".join(soup.get_text(" ").split())
        return txt[:6000]
    return " ".join(html_or_text.split())[:6000]

def extract_og_image(article_url: str) -> str | None:
    try:
        r = requests.get(article_url, headers=UA, timeout=10)
        if r.status_code != 200:
            return None
        s = BeautifulSoup(r.text, "html.parser")
        og = s.find("meta", attrs={"property":"og:image"}) or s.find("meta", attrs={"name":"og:image"})
        if og and og.get("content"):
            return og["content"].strip()
    except Exception:
        pass
    return None

def classify_category(text: str) -> str:
    t = (text or "").lower()
    if any(k in t for k in ["patch", "update", "out-of-band", "kb", "security update"]):
        return "Patch/Update"
    if any(k in t for k in ["breach", "leak", "exposed", "ransomware", "data leak"]):
        return "Data Breach"
    if any(k in t for k in ["cve-", "zero-day", "vulnerability", "rce", "privilege escalation", "deserializ"]):
        return "Vulnerability"
    if any(k in t for k in ["campaign", "apt", "malware", "backdoor", "botnet", "phishing", "exploit"]):
        return "Threat/Attack"
    if any(k in t for k in ["advisory", "directive", "alert"]):
        return "Policy/Advisory"
    return "General"

def extract_cves(text: str):
    return sorted(set(re.findall(r"CVE-\d{4}-\d{4,7}", text or "", flags=re.I)))

def build_summaries(title:str, text:str, source:str, link:str, published_iso:str):
    txt = extract_text_for_summary((text or "") + " " + (title or ""))
    # naive sentence split
    sentences = re.split(r'(?<=[.!?])\s+', txt)
    def pick(regex):
        for s in sentences:
            if re.search(regex, s, re.I): return s
        return ""
    who = pick(r"(microsoft|google|cisa|cisco|oracle|apple|meta|openai|github|cloudflare|aws|azure|palo alto|kaspersky|crowdstrike|mandiant|trend micro|fortinet|checkpoint)")
    what = pick(r"(released|patched|disclosed|reported|warned|issued|exploited|detected|announced|fix|mitigat|ordered)")
    how  = pick(r"(via|through|using|because|due to|caused by|stemming from|unsafe deserializ|phishing|0-day|zero-day|rce)")
    when = published_iso or ""

    action = ""
    if re.search(r"(cve-\d{4}-\d+|zero-day|rce|privilege escalation|deserializ)", txt, re.I):
        action = "حدِّث الأنظمة فورًا، طبّق إرشادات المورّد، وراقب مؤشرات الاستغلال."
    elif re.search(r"(breach|leak|exposed|ransom)", txt, re.I):
        action = "اعزل الأنظمة المتأثرة، فعِّل incident response، وأخطر الأطراف المعنية."
    elif re.search(r"(phishing|malware|campaign|botnet)", txt, re.I):
        action = "حدّث التواقيع، احظر الـ IOCs، وفعِّل التوعية للمستخدمين."
    else:
        action = "اتّبع إرشادات المصدر وطبّق أفضل الممارسات."

    summary_en = (
        f"Who: {who or title}. "
        f"What: {what or title}. "
        f"When: {when}. "
        f"How: {how or 'Details in the source.'} "
        f"Action: {'Apply vendor guidance and monitor indicators.' if not action else 'See Arabic action below.'}"
    )

    summary_ar = (
        f"من: {who or title}. "
        f"ماذا: {what or title}. "
        f"متى: {when}. "
        f"كيف: {how or 'تفاصيل إضافية بالمصدر'}. "
        f"الإجراء: {action}"
    )

    category = classify_category(txt + " " + title)
    return summary_en, summary_ar, category, action

# ---------- De-dup ----------
def similar(a, b):
    return fuzz.token_set_ratio(a, b)

def merge_items(items):
    items = sorted(items, key=lambda x: x["published"], reverse=True)
    merged = []
    for it in items:
        matched = None
        for m in merged:
            if similar(m["title"], it["title"]) >= SIM_THRESHOLD:
                matched = m
                break
        if matched:
            # دمج المصادر
            for s in it.get("sources", []):
                if s not in matched["sources"]:
                    matched["sources"].append(s)
            # خُذ صورة لو مفيش
            if (not matched.get("image")) and it.get("image"):
                matched["image"] = it["image"]
            # خُذ CVEs إضافية
            matched["cves"] = sorted(set((matched.get("cves") or []) + (it.get("cves") or [])))
        else:
            merged.append(it)
    return merged

# ---------- Main ----------
def parse_feed(url):
    feed = feedparser.parse(url)
    out = []
    for e in feed.entries:
        title = e.get("title", "").strip()
        link = e.get("link", "").strip()
        if not title or not link:
            continue

        published = e.get("published") or e.get("updated") or ""
        published_iso = to_iso(published) or iso_now()

        # النص من الملخص أو المحتوى
        content_html = e.get("summary", "") or ""
        if "content" in e and e.content:
            # content قد يحتوي HTML
            try:
                content_html = e.content[0].value or content_html
            except Exception:
                pass

        host = host_from_url(link)

        # جلب صورة og:image
        image_url = extract_og_image(link)

        # CVEs
        cves = extract_cves(title + " " + content_html)

        # Summaries
        sum_en, sum_ar, category, action = build_summaries(title, content_html, host, link, published_iso)

        out.append({
            "id": sha_id(link),
            "title": title,
            "link": link,
            "published": published_iso,
            "source": host,
            "summary_en": sum_en,
            "summary_ar": sum_ar,
            "category": category,
            "action": action,
            "cves": cves,
            "cvss": [],
            "impacted": [],
            "image": image_url or "",
            "sources": [link],
        })
    return out

def keep_recent(items, days=DAYS_WINDOW):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    kept = []
    for it in items:
        try:
            d = dtparser.parse(it["published"]).astimezone(timezone.utc)
            if d >= cutoff:
                kept.append(it)
        except Exception:
            kept.append(it)
    return kept

def load_existing():
    if not os.path.isfile(NEWS_JSON):
        return []
    try:
        with open(NEWS_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save(items):
    with open(NEWS_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

def main():
    print("[*] fetching feeds...")
    all_items = []
    for u in SOURCES:
        try:
            print("   -", u)
            all_items.extend(parse_feed(u))
        except Exception as ex:
            print("     ! feed error:", ex)

    if not all_items:
        print("[!] no new items fetched")
        return

    # ضم مع الأخبار القديمة
    existing = load_existing()
    all_items.extend(existing)

    # dedup + merge
    merged = merge_items(all_items)

    # recent window
    recent = keep_recent(merged, DAYS_WINDOW)

    # sort desc
    recent.sort(key=lambda x: x["published"], reverse=True)

    save(recent)
    print(f"[+] news.json updated: {len(recent)} items")

if __name__ == "__main__":
    main()
