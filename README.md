# Conversations Webpage

Static website repository for the conversation webpage.

## Structure

- `index.html` — main entry page
- `pages/` — additional HTML pages
- `posts/`, `_posts/` — content collections
- `css/` — stylesheets
- `js/` — client-side scripts
- `howard.js` — custom JS helper
- `force-deploy` — deploy trigger file (touch/update when needed)

## Fast Update Workflow

### 1) Edit
Make your content/style/script changes directly in:
- `index.html`
- `pages/*`
- `css/*`
- `js/*`

### 2) Local Preview
From repo root:

```bash
cd conversations
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### 3) Commit + Push

```bash
git add -A
git commit -m "Update conversations webpage"
git push origin main
```

### 4) Force deploy (if hosting cache/deploy hook needs retrigger)

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ" > force-deploy
git add force-deploy
git commit -m "Trigger redeploy"
git push origin main
```

## Suggested Commit Message Format

- `feat(web): add <page/section>`
- `fix(web): correct <issue>`
- `style(web): adjust <layout/theme>`
- `content(web): update <copy/post>`
