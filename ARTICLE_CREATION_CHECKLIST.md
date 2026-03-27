# News Article Creation Checklist

## 1. Article Metadata
- [ ] Title (SEO-friendly, under 60 chars)
- [ ] Description (under 160 chars for meta)
- [ ] Category (Tech Briefing, World Watch, etc.)
- [ ] Headline (compelling, under 100 chars)
- [ ] Date (YYYY-MM-DD format)
- [ ] Tags (5-7 relevant keywords)

## 2. Content
- [ ] Hero image (generate or source)
  - Filename: `{slug}-hero.png`
  - Size: 1200x630px (optimal for social)
  - Alt text for accessibility
  - Caption
- [ ] Lead paragraph (2-3 sentences, hook the reader)
- [ ] Article body (3-5 sections with H2 headers)
- [ ] Inline images (optional, 800x400px)
- [ ] Conclusion/sign-off

## 3. Audio Generation
- [ ] Write conversational script (Howard voice)
- [ ] Generate using Bruce voice clone
- [ ] Convert to MP3
- [ ] Test audio playback
- [ ] Note duration for player display

## 4. File Creation
- [ ] Copy TEMPLATE-news-article.html
- [ ] Replace all {{VARIABLES}}
- [ ] Save as `pages/YYYY-MM-DD-{slug}.html`
- [ ] Add to index.html news list

## 5. Assets
- [ ] Hero image → `assets/images/{slug}-hero.png`
- [ ] Audio MP3 → `assets/audio/{slug}.mp3`
- [ ] Audio WAV → `assets/audio/{slug}.wav` (backup)
- [ ] Script TXT → `assets/audio/{slug}-script.txt` (archive)

## 6. Testing
- [ ] Page loads (HTTP 200)
- [ ] Images display correctly
- [ ] Audio player works
- [ ] Mobile responsive
- [ ] Links work (back to newsroom, etc.)

## 7. Publishing
- [ ] Git add all new files
- [ ] Commit with descriptive message
- [ ] Push to origin
- [ ] Verify live on www.rustwood.au
- [ ] Test audio on live site

---

## Quick Commands

```bash
# Generate audio
cd /home/rustwood/.openclaw/workspace
.venv-pocket/bin/python3 generate_audio.py

# Commit and push
cd /home/rustwood/.openclaw/workspace/conversations
git add -A
git commit -m "Add article: {title}"
git push origin main

# Test page
curl -sI https://www.rustwood.au/pages/{filename}.html
```
