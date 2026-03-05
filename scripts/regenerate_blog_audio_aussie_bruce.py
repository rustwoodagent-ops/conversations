#!/usr/bin/env python3
import os
import re
import json
import html
import pathlib
import urllib.request
import urllib.parse

VOICE_ID = "hk6wpUusj7FFV03U5LvR"  # Aussie Bruce
MODEL_ID = "eleven_multilingual_v2"
OUTPUT_FORMAT = "mp3_44100_128"

AGENTS = [
    "Howard", "Tenzo", "Ada", "Briggs", "Cora", "Felix", "Harper", "Scout", "Iris", "Juno",
    "Gideon", "Mason", "Dispatcher", "Controller", "Ledger", "Librarian", "Pulse", "Sentinel",
    "Vault", "Gatekeeper", "Switchboard", "Patch", "Postmaster", "Drafter", "Scheduler",
    "Auditor", "Curator", "Analyst", "Concierge", "Archivist",
]

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = ROOT / "pages"


def strip_tags(s: str) -> str:
    s = re.sub(r"<script[\s\S]*?</script>", " ", s, flags=re.I)
    s = re.sub(r"<style[\s\S]*?</style>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def get_title(doc: str, fallback: str) -> str:
    m = re.search(r"<title>(.*?)</title>", doc, flags=re.I | re.S)
    return strip_tags(m.group(1)) if m else fallback


def get_article_block(doc: str) -> str:
    m = re.search(r"<article[^>]*>([\s\S]*?)</article>", doc, flags=re.I)
    return m.group(1) if m else ""


def get_article_text(doc: str) -> str:
    return strip_tags(get_article_block(doc))


def get_headings(doc: str):
    block = get_article_block(doc)
    hs = re.findall(r"<h[23][^>]*>([\s\S]*?)</h[23]>", block, flags=re.I)
    clean = [strip_tags(h) for h in hs if strip_tags(h)]
    return clean[:5]


def detect_agents(text: str):
    found = []
    lower = text.lower()
    for name in AGENTS:
        if name.lower() in lower and name not in found:
            found.append(name)
    return found[:8]


def build_script(title: str, article_text: str, headings, agents):
    sentences = re.split(r"(?<=[.!?])\s+", article_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    core = sentences[:4]

    intro = (
        f"G'day, quick update from Howard. This post is called {title}. "
        "Here’s the conversational version so you can get the signal fast. "
    )

    points = []
    for h in headings[:3]:
        points.append(f"Key focus: {h}.")

    if core:
        points.append("In short: " + " ".join(core[:2]))
        if len(core) > 2:
            points.append("What this means in practice: " + core[2])

    if agents:
        if len(agents) == 1:
            agent_line = f"Agent update callout: {agents[0]} is directly involved in this cycle."
        else:
            agent_line = "Agent update callout: this post references " + ", ".join(agents[:-1]) + f", and {agents[-1]}."
    else:
        agent_line = "Agent update callout: this one is more strategic and content-focused than lane-specific."

    outro = (
        "Bottom line: this entry captures what changed, why it matters, and what happens next."
    )

    text = re.sub(r"\s+", " ", " ".join([intro] + points + [agent_line, outro])).strip()
    if len(text) > 2200:
        text = text[:2180].rsplit(" ", 1)[0] + "."
    return text


def get_audio_target(doc: str):
    m = re.search(r"<source\s+src=\"([^\"]+\.mp3)\"", doc, flags=re.I)
    if not m:
        return None
    rel = m.group(1)
    if rel.startswith("../"):
        rel = rel[3:]
    return ROOT / rel


def synthesize(text: str, out_path: pathlib.Path, api_key: str):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format={urllib.parse.quote(OUTPUT_FORMAT)}"
    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.35,
            "speaker_boost": True,
        },
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        audio = resp.read()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(audio)


def main():
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("ELEVENLABS_API_KEY not set")

    pages = []
    for p in sorted(PAGES.glob("*.html")):
        doc = p.read_text(encoding="utf-8", errors="ignore")
        if "blog-audio-player" not in doc:
            continue
        target = get_audio_target(doc)
        if target:
            pages.append((p, doc, target))

    print(f"Found {len(pages)} pages with blog audio player")

    for p, doc, target in pages:
        title = get_title(doc, p.stem)
        text = get_article_text(doc)
        headings = get_headings(doc)
        agents = detect_agents(" ".join([title, text, *headings]))
        script = build_script(title, text, headings, agents)
        synthesize(script, target, api_key)
        print(f"Updated audio: {p.name} -> {target.relative_to(ROOT)} ({len(script)} chars)")


if __name__ == "__main__":
    main()
