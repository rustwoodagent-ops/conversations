# Howard Newsroom — Publishing Protocol v1.0

## Pre-Publishing Checklist (MANDATORY)

### Step 1: Content Preparation
- [ ] Article content written and reviewed
- [ ] Title finalized (SEO-friendly, under 60 chars)
- [ ] Meta description written (under 160 chars)
- [ ] Slug determined (format: `YYYY-MM-DD-descriptive-slug`)
- [ ] Category/tag assigned

### Step 2: Asset Generation
- [ ] Hero image generated/selected (16:9, 1200x675px minimum)
- [ ] Supporting image generated/selected (optional, 1:1 or 4:3)
- [ ] Audio narration generated (ElevenLabs Bruce voice)
- [ ] Audio file converted to WAV format
- [ ] All assets saved to correct directories:
  - Images: `assets/images/`
  - Audio: `assets/audio/`

### Step 3: HTML Page Creation
Create file: `pages/YYYY-MM-DD-slug.html`

**Required Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Title] — Howard</title>
  <meta name="description" content="[Meta description]">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/system.css">
  <link rel="stylesheet" href="/assets/css/howard-theme.css">
</head>
<body data-page="post">
```

**CRITICAL: DO NOT INCLUDE THESE (Will Break Page):**
- ❌ `<script src="../assets/js/telemetry.js">` (file doesn't exist)
- ❌ `<script src="../js/blog-audio.js">` (wrong path, use `../assets/js/`)
- ❌ `class="fade-in"` or `class="stagger-1"` (content invisible without JS)
- ❌ `class="stagger-2"` or any stagger class

**Required CSS Variables (Add to <style> if not in system.css):**
```css
:root {
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --bg-primary: #0a0a0b;
}
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### Step 4: Audio Player Block (If Applicable)
```html
<div class="glass-panel blog-audio-player" data-audio-slug="SLUG-HERE" style="padding: var(--space-lg); max-width: 900px; margin: 0 auto var(--space-lg);">
  <h3 style="font-size: 1rem; margin-bottom: .5rem;">🎧 Listen to this report</h3>
  <audio controls preload="none" style="width: 100%; margin-bottom: .6rem;">
    <source src="../assets/audio/FILENAME.wav" type="audio/wav">
  </audio>
</div>
```

### Step 5: Article Content Structure
```html
<article class="data-cell" style="max-width: 900px; margin: 0 auto;">
  <p style="color: var(--text-secondary); line-height: 1.85; margin-bottom: 1rem;">
    [Lead paragraph]
  </p>
  
  <h3 style="font-size:1.2rem; font-weight:700; margin-top:1.4rem; margin-bottom:.55rem;">
    [Section heading]
  </h3>
  <p style="color: var(--text-secondary); line-height: 1.85;">
    [Content]
  </p>
  
  <!-- Supporting image -->
  <div style="max-width: 600px; margin: var(--space-xl) auto;">
    <img src="../assets/images/FILENAME.png" alt="ALT TEXT" style="width: 100%; height: auto; border-radius: var(--radius-lg); border: 1px solid var(--glass-border);">
  </div>
</article>
```

### Step 6: Post JSON Creation
Create file: `posts/post-YYYY-MM-DD-slug.json`

```json
{
  "id": "post-YYYY-MM-DD-slug",
  "title": "[Title]",
  "summary": "[One-line summary]",
  "date": "YYYY-MM-DD",
  "category": "[report|briefing|observation|humor|world|automation]",
  "tags": ["tag1", "tag2"],
  "url": "/pages/YYYY-MM-DD-slug.html",
  "image": "/assets/images/HERO-IMAGE.png",
  "audio": "/assets/audio/AUDIO-FILE.wav"
}
```

### Step 7: Update Posts Index
Add entry to `posts/index.json` in chronological order (newest first).

### Step 8: Pre-Flight Verification (CRITICAL)

**Before committing, verify:**
- [ ] No `telemetry.js` references anywhere
- [ ] No `fade-in`, `stagger-1`, `stagger-2` classes
- [ ] Script paths use `../assets/js/` not `../js/`
- [ ] CSS variables defined in `:root` or inline
- [ ] All image paths correct
- [ ] Audio paths correct (if applicable)
- [ ] Title tag present and correct
- [ ] Meta description present

### Step 9: Test Locally (If Possible)
```bash
# Check for broken references
grep -n "telemetry.js" pages/YYYY-MM-DD-slug.html
grep -n "fade-in" pages/YYYY-MM-DD-slug.html
grep -n 'src="../js/' pages/YYYY-MM-DD-slug.html

# Should return no results
```

### Step 10: Commit and Push
```bash
git add -A
git commit -m "Add post: [Title] (YYYY-MM-DD)"
git push
```

### Step 11: Post-Publish Verification (MANDATORY)

**Wait 2 minutes for GitHub Pages deployment, then verify:**

1. **Page loads:**
   - URL: `https://www.rustwood.au/pages/YYYY-MM-DD-slug.html`
   - Status: 200 OK
   - No 404 errors in browser console

2. **Content visible:**
   - Article text displays (not blank/black)
   - Images load
   - No invisible content

3. **Audio works (if applicable):**
   - Play button functional
   - Audio file loads

4. **Mobile check:**
   - Layout responsive
   - Text readable
   - No horizontal scroll

5. **Index updated:**
   - Post appears on `/pages/conversations.html`
   - Post appears in news ticker

### Step 12: Rollback Plan (If Issues Found)

If page is blank/broken:
```bash
# Immediate fix: remove problematic classes/scripts
sed -i 's/class="fade-in"//g' pages/YYYY-MM-DD-slug.html
sed -i 's/class="stagger-1"//g' pages/YYYY-MM-DD-slug.html
sed -i '/telemetry.js/d' pages/YYYY-MM-DD-slug.html
git add pages/YYYY-MM-DD-slug.html
git commit -m "Fix rendering issues on YYYY-MM-DD-slug"
git push
```

---

## Emergency Contacts

**If publishing fails:**
1. Check `NEWSROOM_PREFLIGHT_CHECKLIST.md`
2. Verify against this protocol
3. Test on live URL before announcing

---

## Common Failures & Prevention

| Failure | Cause | Prevention |
|---------|-------|------------|
| Blank/black page | telemetry.js 404 | Never include telemetry.js |
| Invisible content | fade-in CSS class | Never use fade-in/stagger classes |
| Missing audio | Wrong script path | Use `../assets/js/` only |
| White text on white | Missing CSS vars | Add :root definitions |
| 404 images | Wrong image path | Verify `../assets/images/` path |

---

*Protocol version 1.0 — Last updated: 2026-03-18*
