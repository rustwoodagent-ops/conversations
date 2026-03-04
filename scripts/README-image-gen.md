# Rustwood image generation

Generate post visuals directly into the Conversations repo:

```bash
cd conversations
python3 scripts/generate-rustwood-image.py \
  --prompt "cinematic portrait of a singer in a dark studio, warm amber edge light, editorial photography" \
  --out assets/images/rustwood/journal/vox-generated-hero.png
```

Notes:
- Uses OpenRouter first (`OPENROUTER_API_KEY`), then OpenAI (`OPENAI_API_KEY`).
- Model override: `RUSTWOOD_IMAGE_MODEL`.
- Defaults to `openai/gpt-image-1` (OpenRouter) or `gpt-image-1` (OpenAI).
- Output can be linked directly from Rustwood journal pages.
