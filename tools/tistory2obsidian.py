"""Convert saved Tistory post HTML (html/<id>.html) into Obsidian notes.

Notes  -> <vault>/6. Posts/tistory/<tistory category>/<title>.md
Images -> <vault>/6. Posts/attachments/tistory-<id>-<k>.<ext>  (embedded as ![[...]])
"""
import html as htmlmod
import json
import re
import sys
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString
from markdownify import MarkdownConverter

WS = Path(__file__).parent
VAULT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Documents" / "Vault"
POSTS = VAULT / "6. Posts"
ATT = POSTS / "attachments"
UA = {"User-Agent": "Mozilla/5.0"}

CATMAP = {
    "picoCTF": ("CTF/Wargame", "picoCTF"),
    "OverTheWire: Bandit": ("CTF/Wargame", "OverTheWire Bandit"),
    "Dreamhack": ("CTF/Wargame", "Dreamhack"),
    "Side Channel Analysis": ("블로그/기술문서", "Side Channel Analysis"),
    "Network": ("블로그/기술문서", "Network"),
    "Cryptography": ("블로그/기술문서", "Cryptography"),
    "Algorithm": ("블로그/기술문서", "Algorithm"),
    "SageMath": ("블로그/기술문서", "SageMath"),
    "Programming": ("개발", "Programming"),
    "VScode": ("개발", "VScode"),
    "Baekjoon": ("개발", "Baekjoon"),
}
EXT = {"image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif", "image/webp": ".webp", "image/svg+xml": ".svg"}


def download(url: str, stem: str) -> str:
    for f in ATT.glob(stem + ".*"):
        return f.name
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)
    data = r.read()
    ext = EXT.get(r.headers.get_content_type(), Path(url.split("?")[0]).suffix or ".png")
    name = stem + ext
    (ATT / name).write_bytes(data)
    return name


def safe_name(title: str) -> str:
    s = re.sub(r'[\\/:*?"<>|#^\[\]]', " ", title)
    return re.sub(r"\s+", " ", s).strip(" .")[:120]


class MD(MarkdownConverter):
    pass


def convert(pid: int, h: str) -> tuple[dict, str]:
    soup = BeautifulSoup(h, "html.parser")
    meta = {p["property"]: p.get("content", "") for p in soup.find_all("meta", property=True)}
    title = htmlmod.unescape(meta["og:title"]).strip()
    title = re.sub(r"\s{2,}", " ", title)
    cat_a = soup.select_one(".tit_category a")
    cat = cat_a.get_text(strip=True) if cat_a else ""
    tags = [a.get_text(strip=True) for a in soup.select('a[rel="tag"]')]
    date = meta.get("article:published_time", "")  # 2026-04-05T16:05:55+09:00
    m = re.match(r"(\d{4}-\d\d-\d\d)T(\d\d:\d\d:\d\d)([+-]\d\d):?(\d\d)", date)
    date = f"{m.group(1)} {m.group(2)} {m.group(3)}{m.group(4)}"

    root = soup.select_one("div.contents_style")
    tokens: dict[str, str] = {}

    def token(md: str) -> NavigableString:
        k = f"TOKEN{len(tokens):04d}X"
        tokens[k] = md
        return NavigableString(f"\n\n{k}\n\n")

    # images (figures + stray imgs)
    k = 0
    for fig in root.select("figure.imageblock, figure.imagegridblock"):
        parts = []
        for img in fig.find_all("img"):
            k += 1
            span = img.find_parent("span", attrs={"data-url": True})
            url = htmlmod.unescape(span["data-url"] if span else img["src"])
            parts.append(f"![[{download(url, f'tistory-{pid}-{k}')}]]")
        cap = fig.find("figcaption")
        if cap and cap.get_text(strip=True):
            parts.append(f"*{cap.get_text(' ', strip=True)}*")
        fig.replace_with(token("\n".join(parts)))
    for img in root.find_all("img"):
        k += 1
        img.replace_with(token(f"![[{download(htmlmod.unescape(img['src']), f'tistory-{pid}-{k}')}]]"))

    # link preview cards
    for fig in root.select('figure[data-ke-type="opengraph"]'):
        t = fig.get("data-og-title") or fig.get("data-og-url")
        u = fig.get("data-og-url") or fig.get("data-og-source-url")
        fig.replace_with(token(f"[{t}]({u})" if u else t or ""))

    # code blocks
    for pre in root.find_all("pre"):
        lang = pre.get("data-ke-language") or (pre.get("class") or [""])[0]
        lang = {"plaintext": "", "bash": "bash", "shell": "bash"}.get(lang, lang)
        code = pre.get_text().replace("\xa0", " ").rstrip("\n")
        fence = "~~~" if "```" in code else "```"
        pre.replace_with(token(f"{fence}{lang}\n{code}\n{fence}"))

    for d in root.select("div.moreless-content, div.btn-toggle-moreless"):
        d.unwrap()

    md = MD(heading_style="ATX", bullets="-", escape_underscores=False, escape_misc=False).convert_soup(root)
    md = md.replace("\xa0", " ")
    for key, val in tokens.items():
        md = md.replace(key, val)
    md = re.sub(r"[ \t]+\n", lambda m: "  \n" if m.group(0).startswith("  ") else "\n", md)
    md = re.sub(r"(?m)^[ \t]+$", "", md)
    md = re.sub(r"^(#{1,6} )\*\*(.+?)\*\*\s*$", r"\1\2", md, flags=re.M)
    md = re.sub(r"^(#{1,6} .*?) +\n", r"\1\n", md, flags=re.M)
    md = re.sub(r"(?m)^(\|(?:\s*\|)+)\n(\|(?:\s*-+\s*\|)+)\n(\|.*)$", r"\3\n\2", md)  # empty header row -> first row as header
    md = md.replace("http://www.formaestudio.com", "https://www.formaestudio.com")  # htmlproofer enforces https
    md = re.sub(r"\n{3,}", "\n\n", md).strip() + "\n"

    top = cat.split("/")[0]
    main, sub = CATMAP.get(top, ("블로그/기술문서", top))
    sub_tags = cat.split("/")[1:]
    clean_title = re.sub(r"^\[[^\]]+\]\s*", "", title) or title
    fm = {
        "title": clean_title,
        "date": date,
        "categories": [main, sub],
        "tags": list(dict.fromkeys(tags + sub_tags)),
        "tistory_url": meta.get("og:url", f"https://heahgo.tistory.com/{pid}"),
        "cat": cat,
    }
    return fm, md


def yaml_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def link_map() -> dict[str, str]:
    """tistory url/id -> note stem, for rewriting cross-post links into [[wikilinks]]."""
    out = {}
    for f in (WS / "html").glob("*.html"):
        h = f.read_text(encoding="utf-8")
        t = re.search(r'og:title" content="([^"]*)"', h)
        u = re.search(r'og:url" content="([^"]*)"', h)
        if not t or "contents_style" not in h:
            continue
        title = re.sub(r"\s{2,}", " ", htmlmod.unescape(t.group(1)).strip())
        stem = safe_name(re.sub(r"^\[[^\]]+\]\s*", "", title) or title)
        out[f"https://heahgo.tistory.com/{f.stem}"] = stem
        if u:
            out[u.group(1)] = stem
    return out


def rewrite_links(md: str, lm: dict[str, str]) -> str:
    def sub(m):
        text = re.sub(r"[\[\]|]", "", m.group(1)).strip()
        url = m.group(2).split("#")[0].rstrip("/")
        url = url.replace("http://", "https://").replace("/m/", "/")
        stem = lm.get(url)
        if not stem:
            return m.group(0)
        return f"[[{stem}|{text}]]" if text and text != stem else f"[[{stem}]]"
    return re.sub(r"(?<!!)\[((?:[^\[\]]|\[[^\]]*\])*)\]\((https?://heahgo\.tistory\.com/[^)\s]+)\)", sub, md)


def main():
    ATT.mkdir(parents=True, exist_ok=True)
    report = []
    lm = link_map()
    for f in sorted((WS / "html").glob("*.html"), key=lambda p: int(p.stem)):
        pid = int(f.stem)
        h = f.read_text(encoding="utf-8")
        if "contents_style" not in h:
            report.append((pid, "SKIP (protected/no content)"))
            continue
        fm, md = convert(pid, h)
        md = rewrite_links(md, lm)
        d = POSTS / "tistory" / safe_name(fm["cat"].replace("/", " - "))
        d.mkdir(parents=True, exist_ok=True)
        out = d / (safe_name(fm["title"]) + ".md")
        lines = [
            "---",
            f"title: {yaml_str(fm['title'])}",
            f"date: {fm['date']}",
            "categories: [" + ", ".join(yaml_str(c) for c in fm["categories"]) + "]",
            "tags: [" + ", ".join(yaml_str(t) for t in fm["tags"]) + "]",
            f"tistory_url: {fm['tistory_url']}",
            "published: true",
            "---",
            "",
        ]
        out.write_text("\n".join(lines) + md, encoding="utf-8", newline="\n")
        report.append((pid, out.relative_to(VAULT).as_posix()))
    for r in report:
        print(*r)


if __name__ == "__main__":
    main()
