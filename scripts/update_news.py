import os, re, json, time, hashlib, datetime as dt
from urllib.parse import urlparse
import feedparser, requests, trafilatura

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

RAW_FILE = "news.json"
MAX_ITEMS = int(os.getenv("MAX_ITEMS", "500"))

RSS_SOURCES = [
    "https://feeds.feedburner.com/TheHackersNews",
    "https://www.bleepingcomputer.com/feed/",
    "https://www.securityweek.com/feed/",
    "https://feeds.feedburner.com/HelpNetSecurity",
    "https://www.darkreading.com/rss.xml",
    "https://www.csoonline.com/index.rss",
    "https://nakedsecurity.sophos.com/feed/",
    "https://www.zdnet.com/feeds/topic/security/",
    "https://feeds.arstechnica.com/arstechnica/security",
    "https://www.theregister.com/security/headlines.atom",
    "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    "https://blog.google/threat-analysis-group/rss/",
    "https://msrc-blog.microsoft.com/feed/",
    "https://blog.talosintelligence.com/feed/",
    "https://unit42.paloaltonetworks.com/feed/",
    "https://www.mandiant.com/resources/blog/rss.xml",
]

HEADERS = {"User-Agent": "azhary-cyber-news/1.0"}

def norm_title(t: str) -> str:
    t = re.sub(r"\s+", " ", (t or "")).strip()
    return t

def item_id(url: str, title: str) -> str:
    base = (url or "") + "|" + (title or "")
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:12]

def fetch_article_text(url: str) -> str:
    try:
        downloaded = trafilatura.fetch_url(url, no_ssl=True)
        if not downloaded:
            r = requests.get(url, timeout=15, headers=HEADERS)
            r.raise_for_status()
            downloaded = r.text
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False) or ""
        return text.strip()
    except Exception:
        return ""

def extract_og_image(url: str) -> str:
    try:
        r = requests.get(url, timeout=10, headers=HEADERS)
        r.raise_for_status()
        m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', r.text, re.I)
        if m: return m.group(1)
    except Exception:
        pass
    try:
        host = urlparse(url).hostname or ""
        if host: return f"https://www.google.com/s2/favicons?domain={host}&sz=256"
    except Exception:
        pass
    return ""

def openai_summarize(article_text: str, title: str):
    import openai, json as _json
    openai.api_key = OPENAI_API_KEY

    prompt = f"""
أنت محرر أمن معلومات. لخص النص التالي بإجابتك عن الأسئلة: من؟ ماذا؟ متى؟ كيف؟ وماذا نفعل الآن؟
أعد النتائج ككائن JSON بالمفاتيح التالية فقط:
{{
  "summary_ar": "",
  "summary_en": "",
  "who": "",
  "what": "",
  "when": "",
  "how": "",
  "action": "",
  "cves": [],
  "cvss": null,
  "affected": [],
  "category": "Patch Update|Data Leak|Ransomware|Vulnerability|Exploit|Breach|Malware|Phishing|Cloud|Mobile|ICS|Supply Chain|General"
}}
القواعد:
- العربي واضح وبسيط (2-4 أسطر) يجاوب الأسئلة الخمسة.
- الإنجليزي مكافئ موجز.
- "when" بتاريخ واضح إن وُجد.
- "action" خطوة عملية قصيرة.
- استخرج CVE/CVSS/المنتجات إن وُجدت.
- اختر تصنيفًا واحدًا من القائمة أو الأقرب.
- لا تكتب أي نص خارج JSON.
العنوان: {title}
النص:
\"\"\"{article_text[:6000]}\"\"\"
""".strip()

    completion = openai.chat.completions.create(
        model=MODEL,
        messages=[{"role":"user","content":prompt}],
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    data = json.loads(completion.choices[0].message.content)
    data["cves"] = [c.strip() for c in data.get("cves", []) if isinstance(c, str)]
    if data.get("cvss") in ("", "null"): data["cvss"] = None
    data["affected"] = [a.strip() for a in data.get("affected", []) if isinstance(a, str)]
    if not data.get("category"): data["category"] = "General"
    return data

def classify_tags(row):
    tags = []
    t = f"{row.get('title','')} {row.get('summary_en','')}".lower()
    if "ransom" in t: tags.append("Ransomware")
    if "zero-day" in t or "0-day" in t: tags.append("Zero-day")
    if "phish" in t: tags.append("Phishing")
    if "patch" in t or "update" in t or "kb" in t: tags.append("Patch")
    if "leak" in t or "breach" in t or "exposed" in t: tags.append("Data Leak")
    return list(dict.fromkeys(tags))

def main():
    old = []
    if os.path.exists(RAW_FILE):
        try: old = json.load(open(RAW_FILE,"r",encoding="utf-8"))
        except Exception: old = []

    seen = {}
    for o in old:
        key = (norm_title(o.get("title","")).lower(), urlparse(o.get("source","") or o.get("link","")).hostname or "")
        seen[key] = o

    items = []

    for feed in RSS_SOURCES:
        d = feedparser.parse(feed)
        for e in d.entries[:30]:
            link = e.get("link",""); title = norm_title(e.get("title",""))
            if not link or not title: continue
            host = urlparse(link).hostname or ""
            key = (title.lower(), host)
            if key in seen:
                items.append(seen[key]); continue

            published = None
            for k in ("published_parsed","updated_parsed"):
                if e.get(k): published = dt.datetime(*e[k][:6], tzinfo=dt.timezone.utc).isoformat(); break
            if not published:
                published = dt.datetime.utcnow().replace(tzinfo=dt.timezone.utc).isoformat()

            text = fetch_article_text(link)
            if len(text) < 400:
                base = {
                    "id": item_id(link, title), "title": title, "link": link,
                    "published": published, "source": host, "sources":[link],
                    "summary_ar":"", "summary_en":"", "who":"", "what":"", "when":"", "how":"", "action":"",
                    "cves":[], "cvss": None, "affected":[],
                    "category":"General", "categories":["General"], "tags":[],
                    "img": extract_og_image(link)
                }
                items.append(base); continue

            try: ai = openai_summarize(text, title)
            except Exception:
                ai = {"summary_ar":"", "summary_en":"", "who":"", "what":"", "when":"", "how":"", "action":"",
                      "cves":[], "cvss": None, "affected": [], "category":"General"}

            row = {
                "id": item_id(link, title),
                "title": title, "link": link, "published": published,
                "source": host, "sources":[link],
                **ai,
                "categories": list({ai.get("category","General")}),
                "tags": classify_tags(ai),
                "img": extract_og_image(link)
            }
            items.append(row)
            time.sleep(0.3)

    all_items = items + old
    dedup = {}
    for r in all_items:
        key = (norm_title(r.get("title","")).lower(),
               urlparse(r.get("source","") or r.get("link","")).hostname or "")
        if key not in dedup:
            dedup[key] = r
        else:
            ss = list({*(dedup[key].get("sources") or []), *(r.get("sources") or [])})
            dedup[key]["sources"] = ss

    final = list(dedup.values())
    final.sort(key=lambda x: str(x.get("published","")), reverse=True)
    final = final[:MAX_ITEMS]

    with open(RAW_FILE,"w",encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
