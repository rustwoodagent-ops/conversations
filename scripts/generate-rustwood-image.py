#!/usr/bin/env python3
"""
Generate images for Rustwood posts via OpenAI-compatible Images API.
Supports OpenRouter or OpenAI style endpoints.

Usage:
  python3 scripts/generate-rustwood-image.py \
    --prompt "cinematic studio portrait" \
    --out assets/images/rustwood/journal/new-image.png

Env/key resolution order:
  1) OPENROUTER_API_KEY + OPENROUTER_BASE_URL (default https://openrouter.ai/api/v1)
  2) OPENAI_API_KEY + OPENAI_BASE_URL (default https://api.openai.com/v1)
"""

import argparse
import base64
import json
import os
from pathlib import Path
import requests


def load_openclaw_env() -> dict:
    cfg = Path.home() / ".openclaw" / "openclaw.json"
    if not cfg.exists():
        return {}
    try:
        data = json.loads(cfg.read_text())
        env = data.get("env", {})
        if isinstance(env, dict):
            return {k: v for k, v in env.items() if isinstance(v, str)}
    except Exception:
        pass
    return {}


def pick_provider(extra_env: dict):
    env = {**extra_env, **os.environ}
    or_key = env.get("OPENROUTER_API_KEY", "").strip()
    oa_key = env.get("OPENAI_API_KEY", "").strip()

    if or_key:
        base = env.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
        model = env.get("RUSTWOOD_IMAGE_MODEL", "openai/gpt-image-1")
        return {
            "name": "openrouter",
            "url": f"{base}/images/generations",
            "headers": {
                "Authorization": f"Bearer {or_key}",
                "Content-Type": "application/json",
            },
            "model": model,
        }

    if oa_key:
        base = env.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = env.get("RUSTWOOD_IMAGE_MODEL", "gpt-image-1")
        return {
            "name": "openai",
            "url": f"{base}/images/generations",
            "headers": {
                "Authorization": f"Bearer {oa_key}",
                "Content-Type": "application/json",
            },
            "model": model,
        }

    raise SystemExit("No image generation key found (OPENROUTER_API_KEY or OPENAI_API_KEY)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", default="1536x1024")
    ap.add_argument("--quality", default="high")
    args = ap.parse_args()

    provider = pick_provider(load_openclaw_env())

    payload = {
        "model": provider["model"],
        "prompt": args.prompt,
        "size": args.size,
        "quality": args.quality,
        "n": 1,
        "response_format": "b64_json",
    }

    resp = requests.post(provider["url"], headers=provider["headers"], json=payload, timeout=180)
    if resp.status_code != 200:
        raise SystemExit(f"Image generation failed ({resp.status_code}): {resp.text[:500]}")

    data = resp.json().get("data", [])
    if not data:
        raise SystemExit("Image generation returned no data")

    b64 = data[0].get("b64_json")
    if not b64:
        # fallback for URL-only responses
        url = data[0].get("url")
        if not url:
            raise SystemExit("No b64_json or url in response")
        r2 = requests.get(url, timeout=180)
        r2.raise_for_status()
        content = r2.content
    else:
        content = base64.b64decode(b64)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(content)
    print(f"saved: {out}")


if __name__ == "__main__":
    main()
