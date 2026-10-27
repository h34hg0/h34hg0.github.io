#!/usr/bin/env python3
"""Publish Obsidian notes to this Chirpy blog.

Source : <vault>/6. Posts/**/*.md  (only notes whose front matter has `published: true`)
Output : _posts/YYYY-MM-DD-<slug>.md  +  assets/img/posts/<slug>/<image>

Conversions
  ![[img.png]] / ![[img.png|300]]   -> ![img](/assets/img/posts/<slug>/img.png){: width="300" }
  ![alt](relative/img.png)          -> same, image copied
  [[Note]] / [[Note|alias]]         -> link to the post if Note is published, else plain text
  > [!tip] Title ...                -> Chirpy prompt box ({: .prompt-tip })
  %% comment %%                     -> removed
  $...$ / $$...$$ present           -> `math: true` added when not set
Fenced code blocks and inline code are left untouched.

Sync: generated posts carry `obsidian_source:`; a generated post whose note was
deleted or unpublished is removed. Hand-written posts are never touched.

Usage
  python tools/obsidian_publish.py            # sync + git commit
  python tools/obsidian_publish.py --push     # sync + commit + push
  python tools/obsidian_publish.py --dry-run  # show what would change
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
from pathlib import Path

BLOG = Path(__file__).resolve().parent.parent
DEFAULT_VAULT = Path.home() / "Documents" / "Vault"
POSTS_DIR_NAME = "6. Posts"
IMG_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"}
CALLOUTS = {
    "note": "info", "info": "info", "abstract": "info", "summary": "info", "todo": "info",
    "example": "info", "quote": "info", "cite": "info", "question": "info", "faq": "info",
    "tip": "tip", "hint": "tip", "important": "tip", "success": "tip", "check": "tip", "done": "tip",
    "warning": "warning", "caution": "warning", "attention": "warning",
    "danger": "danger", "error": "danger", "bug": "danger", "failure": "danger", "fail": "danger",
}
FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.S)
DATE_PREFIX = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+)$")


# ---------------------------------------------------------------- front matter
def split_front_matter(text: str) -> tuple[str, str]:
    m = FM_RE.match(text)
    if not m:
        return "", text
    return m.group(1), text[m.end():]


def fm_get(fm: str, key: str) -> str | None:
    m = re.search(rf"^{re.escape(key)}\s*:\s*(.*?)\s*$", fm, re.M)
    if not m:
        return None
    return m.group(1).strip().strip("'\"")


def fm_set(fm: str, key: str, value: str) -> str:
    line = f"{key}: {value}"
    if re.search(rf"^{re.escape(key)}\s*:", fm, re.M):
        return re.sub(rf"^{re.escape(key)}\s*:.*$", line, fm, count=1, flags=re.M)
    return fm.rstrip("\n") + "\n" + line


# ---------------------------------------------------------------- helpers
def slugify(name: str) -> str:
    s = re.sub(r"[\s_]+", "-", name.strip())
    s = re.sub(r"[^\w\-.가-힣]", "", s)  # keep letters/digits/Korean/-/.
    s = re.sub(r"-{2,}", "-", s).strip("-.")
    return s.lower() or "post"


def safe_filename(name: str) -> str:
    stem, ext = os.path.splitext(name)
    return slugify(stem) + ext.lower()


def build_file_index(vault: Path) -> dict[str, Path]:
    """basename (lowercase) -> path, for resolving ![[embeds]] anywhere in the vault."""
    idx: dict[str, Path] = {}
    for root, dirs, files in os.walk(vault):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in files:
            idx.setdefault(f.lower(), Path(root) / f)
    return idx


def protect_code(body: str) -> tuple[str, list[str]]:
    """Replace fenced code blocks and inline code with placeholders."""
    saved: list[str] = []

    def keep(m: re.Match) -> str:
        saved.append(m.group(0))
        return f"\x00{len(saved) - 1}\x00"

    body = re.sub(r"^(```|~~~).*?^\1[ \t]*$", keep, body, flags=re.M | re.S)
    body = re.sub(r"`[^`\n]+`", keep, body)
    return body, saved


def restore_code(body: str, saved: list[str]) -> str:
    return re.sub(r"\x00(\d+)\x00", lambda m: saved[int(m.group(1))], body)


# ---------------------------------------------------------------- conversion
class Converter:
    def __init__(self, vault: Path, index: dict[str, Path], links: dict[str, str]):
        self.vault = vault
        self.index = index
        self.links = links  # note title (lower) -> post url
        self.warnings: list[str] = []

    def copy_image(self, src: Path, slug: str, dest_root: Path) -> str:
        name = safe_filename(src.name)
        dest = dest_root / slug / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or dest.read_bytes() != src.read_bytes():
            shutil.copy2(src, dest)
        return f"/assets/img/posts/{slug}/{name}"

    def resolve(self, target: str, note_dir: Path) -> Path | None:
        target = urllib.parse.unquote(target.split("#")[0].split("|")[0].strip())
        for cand in (note_dir / target, self.vault / target):
            if cand.is_file():
                return cand
        return self.index.get(Path(target).name.lower())

    def convert(self, body: str, note: Path, slug: str, img_root: Path) -> str:
        body, saved = protect_code(body)
        note_dir = note.parent

        body = re.sub(r"%%.*?%%", "", body, flags=re.S)

        # ![[embed|opts]]
        def embed(m: re.Match) -> str:
            target, _, opt = m.group(1).partition("|")
            src = self.resolve(target, note_dir)
            if src is None or src.suffix.lower() not in IMG_EXT:
                self.warnings.append(f"{note.name}: embed not converted: ![[{m.group(1)}]]")
                return Path(target).stem
            url = self.copy_image(src, slug, img_root)
            attr = ""
            if re.fullmatch(r"\d+(x\d+)?", opt.strip()):
                w, _, h = opt.strip().partition("x")
                attr = f'{{: width="{w}"' + (f' height="{h}"' if h else "") + " }"
            return f"![{src.stem}]({url}){attr}"

        body = re.sub(r"!\[\[([^\]]+)\]\]", embed, body)

        # ![alt](local/path.png)
        def md_image(m: re.Match) -> str:
            alt, target = m.group(1), m.group(2).strip()
            if re.match(r"^(https?:)?//|^/assets/", target):
                return m.group(0)
            src = self.resolve(target.strip("<>"), note_dir)
            if src is None:
                self.warnings.append(f"{note.name}: image not found: {target}")
                return m.group(0)
            return f"![{alt}]({self.copy_image(src, slug, img_root)})"

        body = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", md_image, body)

        # [[Note#heading|alias]]
        def wikilink(m: re.Match) -> str:
            target, _, alias = m.group(1).partition("|")
            page, _, heading = target.partition("#")
            text = alias or (page or heading)
            url = self.links.get(page.strip().lower())
            if url:
                if heading:
                    url += "#" + slugify(heading)
                return f"[{text}]({url})"
            return text

        body = re.sub(r"(?<!!)\[\[([^\]]+)\]\]", wikilink, body)

        body = self.callouts(body)
        return restore_code(body, saved)

    @staticmethod
    def callouts(body: str) -> str:
        lines = body.split("\n")
        out: list[str] = []
        i = 0
        head = re.compile(r"^>\s*\[!(\w+)\][+-]?\s*(.*)$")
        while i < len(lines):
            m = head.match(lines[i])
            if not m:
                out.append(lines[i])
                i += 1
                continue
            kind = CALLOUTS.get(m.group(1).lower(), "info")
            block = [f"> **{m.group(2).strip()}**"] if m.group(2).strip() else []
            i += 1
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i])
                i += 1
            if not block:
                block = ["> "]
            out.extend(block)
            out.append(f"{{: .prompt-{kind} }}")
        return "\n".join(out)


# ---------------------------------------------------------------- main
def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(BLOG), *args], check=check,
                          capture_output=True, text=True, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--vault", type=Path, default=DEFAULT_VAULT)
    ap.add_argument("--posts-dir", default=POSTS_DIR_NAME, help="folder inside the vault")
    ap.add_argument("--push", action="store_true", help="git push after committing")
    ap.add_argument("--no-commit", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    src_dir = a.vault / a.posts_dir
    if not src_dir.is_dir():
        print(f"[!] not found: {src_dir}")
        return 1
    posts_dir, img_root = BLOG / "_posts", BLOG / "assets" / "img" / "posts"

    # 1) collect published notes
    notes = []
    for note in sorted(src_dir.rglob("*.md")):
        text = note.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
        fm, body = split_front_matter(text)
        if (fm_get(fm, "published") or "").lower() != "true":
            continue
        m = DATE_PREFIX.match(note.stem)
        date = fm_get(fm, "date")
        if not date:
            if m:
                date = m.group(1)
            else:
                date = dt.datetime.fromtimestamp(note.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S +0900")
                print(f"[i] {note.name}: no date, using file mtime {date}")
            fm = fm_set(fm, "date", date)
        day = date[:10]
        slug = slugify(fm_get(fm, "slug") or (m.group(2) if m else note.stem))
        if not fm_get(fm, "title"):
            fm = fm_set(fm, "title", m.group(2) if m else note.stem)
        notes.append((note, fm, body, day, slug))

    links = {}
    for note, _, _, _, slug in notes:
        stem = DATE_PREFIX.sub(r"\2", note.stem)
        links[note.stem.lower()] = links[stem.lower()] = f"/posts/{slug}/"

    # 2) convert & write
    conv = Converter(a.vault, build_file_index(a.vault), links)
    wanted: dict[Path, str] = {}
    for note, fm, body, day, slug in notes:
        rel = note.relative_to(a.vault).as_posix()
        out_body = body if a.dry_run else conv.convert(body, note, slug, img_root)
        if re.search(r"\$\$|(?<![\\$])\$[^$\n]+\$", body) and fm_get(fm, "math") is None:
            fm = fm_set(fm, "math", "true")
        fm = fm_set(fm, "obsidian_source", f'"{rel}"')
        wanted[posts_dir / f"{day}-{slug}.md"] = f"---\n{fm.strip()}\n---\n\n{out_body.lstrip()}"

    changed = []
    for path, content in wanted.items():
        old = path.read_text(encoding="utf-8").replace("\r\n", "\n") if path.exists() else None
        if old != content:
            changed.append(("+" if old is None else "~", path))
            if not a.dry_run:
                path.write_text(content, encoding="utf-8", newline="\n")

    # 3) remove generated posts whose note is gone/unpublished
    for path in posts_dir.glob("*.md"):
        fm, _ = split_front_matter(path.read_text(encoding="utf-8").replace("\r\n", "\n"))
        if fm_get(fm, "obsidian_source") and path not in wanted:
            changed.append(("-", path))
            if not a.dry_run:
                path.unlink()
                m = DATE_PREFIX.match(path.stem)
                if m and (img_root / m.group(2)).is_dir():
                    shutil.rmtree(img_root / m.group(2))

    for w in conv.warnings:
        print(f"[!] {w}")
    for op, p in changed:
        print(f"{op} {p.relative_to(BLOG).as_posix()}")
    print(f"published notes: {len(notes)}, changed posts: {len(changed)}")

    if a.dry_run or a.no_commit:
        return 0
    git("add", "-A", "_posts", "assets/img/posts")
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        print("nothing to commit")
    else:
        git("commit", "-m", f"post: sync from Obsidian ({len(changed)} changed)")
        print(git("log", "--oneline", "-1").stdout.strip())
    if a.push:
        r = git("-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential",
                "push", check=False)
        print((r.stdout + r.stderr).strip())
        return r.returncode
    return 0


if __name__ == "__main__":
    sys.exit(main())
