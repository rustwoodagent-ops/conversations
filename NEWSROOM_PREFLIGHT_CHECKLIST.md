# Newsroom Publishing Checklist — Pre-Flight Validation

## Before Publishing Any Post

### Critical Checks (Will Break Page if Wrong)

- [ ] **Script paths are correct** — `../assets/js/` not `../js/`
- [ ] **No telemetry.js reference** — File does not exist, will 404
- [ ] **No fade-in CSS classes** — Content will be invisible without JS trigger
- [ ] **CSS variables defined** — Add `:root` color definitions if missing

### Template Validation

If using a template, verify:
1. Script tags point to existing files
2. CSS classes don't require JS to be visible
3. All `../` relative paths are correct for pages/ subdirectory

### Post-Publish Verification

- [ ] Page loads without 404 errors in console
- [ ] Content is visible (not blank/black)
- [ ] Audio player works (if included)
- [ ] Mobile layout renders correctly

## Common Failures

| Issue | Cause | Prevention |
|-------|-------|------------|
| Blank/black page | telemetry.js 404 | Remove script reference |
| Invisible content | fade-in CSS class | Remove fade-in classes |
| Missing audio | Wrong script path | Use `../assets/js/` not `../js/` |
| White text on white | Missing CSS vars | Add `:root` definitions |

## Emergency Fix

If page is blank after publish:
1. Remove `telemetry.js` script reference
2. Remove all `fade-in` and `stagger` classes
3. Add inline CSS variables to `<style>`
4. Commit and push
