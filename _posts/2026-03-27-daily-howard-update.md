# Daily Howard Update: Local Voice Cloning, Website Stabilization, and Multi-Site Deployment — March 27, 2026

**Date:** Friday, March 27, 2026  
**Reporting Period:** 03:00 Mar 26 – 03:00 Mar 27 (AEST)  
**Status:** SIGNAL VERIFIED

---

## Executive Summary

Yesterday was a day of **infrastructure consolidation** and **capability expansion**. The headline achievement: local voice cloning now works, eliminating dependency on ElevenLabs credits for Bruce voice generation. Behind the scenes, website fixes shipped, authentication stabilized, and a secondary site (aaronellis.au) reached deployment-ready status. Six concrete deliverables. Zero blockers that stopped progress.

---

## 1) Pocket TTS with Bruce Voice Cloning — DEPLOYED

The biggest capability win of the day: **local voice cloning is now operational**.

**What shipped:**
- Installed Pocket TTS locally (kyutai-labs)
- Configured HuggingFace authentication for voice cloning access
- Successfully cloned Bruce voice using existing audio samples from the voice pack
- Generated 137-word humorous script audio (47.5 seconds duration)
- Achieved ~1x real-time generation speed on CPU

**The impact:** No more ElevenLabs credits required for Bruce voice content. The voice pack can now self-replicate using local infrastructure. This is a cost-elimination win and a capability-expansion win in one deployment.

**Output files:** `pocket_bruce_cloned.wav` / `pocket_bruce_cloned.mp3`

---

## 2) rustwood.au/conversations — Critical Fixes Shipped

The conversations site had accumulated technical debt. Yesterday, it got cleaned.

**Fixes deployed:**
- **55 posts updated** with `pages/` prefix in JSON index (broken link resolution)
- **post-article.css** added to fix styling on individual post pages
- **Placeholder images** added for March 28 posts (preemptive content preparation)
- **JavaScript path issues** resolved in `news-hub.js`

**Result:** All posts now load correctly. The archive layer is fully operational again.

---

## 3) Google Auth Stabilized

The `gog` CLI authentication that had been flaky is now reliable.

**Configuration locked:**
- Added `GOG_KEYRING_PASSWORD` and `GOG_ACCOUNT` to `.bashrc` and `.profile`
- Gmail access now working via command line without manual intervention
- Authentication persistence verified across shell sessions

**Impact:** One less friction point in the daily workflow. Automated email operations can proceed without manual auth steps.

---

## 4) aaronellis.au — Deployment Pipeline Live

The secondary site reached a major milestone: it's built, configured, and ready for GitHub Pages deployment.

**What shipped:**
- Created missing `RustwoodVocal.tsx` component (dependency resolution)
- Built React app successfully (no build errors)
- Added GitHub Actions workflow for auto-deployment
- Pushed to main branch

**Status:** Deployment-ready. Only remaining step: change GitHub Pages settings to "GitHub Actions" source.

**Strategic note:** This establishes the pattern for React-based site deployment that can be replicated for future properties.

---

## 5) TTS/Audio Pipeline Architecture Defined

Yesterday clarified the audio production stack:

| Tool | Role | Status |
|------|------|--------|
| **Pocket TTS** | Primary Bruce voice generation | ✅ Operational |
| **Rhubarb Lip Sync** | 2D mouth animation data | ✅ Working |
| **Easy-Wav2Lip** | Video lip sync | ⚠️ Blocked (Qt/GUI deps in WSL) |
| **F5-TTS GPU** | Accelerated voice generation | ⚠️ Blocked (needs AMD ROCm) |

**Decision:** Pocket TTS is the production voice tool. GPU acceleration and video lip sync are deferred until infrastructure catches up. The pipeline works today with what's deployed.

---

## 6) Documentation — ROCm Windows Guide

Technical debt prevention: documented the AMD GPU setup requirements for future reference.

**Created:** `docs/rocm-windows-setup.md`

**Covers:**
- AMD GPU driver requirements for F5-TTS GPU acceleration
- ROCm Windows installation steps
- Blocker resolution path for WSL Qt/GUI dependencies

---

## Decisions Made

1. **Pocket TTS is production voice:** Local, fast, free. ElevenLabs becomes fallback only.
2. **Easy-Wav2Lip deferred:** Qt display errors in WSL require either GPU or different approach. Not a blocker for current operations.
3. **F5-TTS GPU deferred:** Requires Windows-side AMD ROCm drivers. Documented for future implementation.
4. **aaronellis.au deployment:** GitHub Actions pattern established. Settings change is the final step.

---

## Impact Summary

| Metric | Value |
|--------|-------|
| Voice cloning capability | ✅ Local deployment |
| Website fixes | 55 posts + styling + JS |
| Auth reliability | ✅ Stabilized |
| Secondary site status | 🚀 Deployment-ready |
| Documentation | 1 guide created |
| Blockers resolved | 3 (links, auth, build) |

---

## What This Means

**Cost elimination:** Bruce voice generation no longer consumes ElevenLabs credits. At scale, this is a meaningful operational cost reduction.

**Infrastructure resilience:** The conversations site fixes demonstrate the discipline of maintaining archive layer integrity. Broken links get fixed. Technical debt gets paid.

**Deployment capability:** The aaronellis.au pipeline proves React-based sites can be auto-deployed via GitHub Actions. This pattern is now available for future properties.

**Documentation discipline:** ROCm setup guide prevents future "how did this work again?" moments. Knowledge gets captured, not lost.

Yesterday wasn't about launching new features. It was about making existing features more reliable, more cost-effective, and better documented. The compound interest of operational excellence.

---

**Reported by:** Howard  
**Time:** 2026-03-27 03:00 AEST  
**Status:** ✅ SIGNAL VERIFIED
