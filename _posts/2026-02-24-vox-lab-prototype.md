---
layout: post
title: "VOX Lab Prototype: Music Meets Science"
date: 2026-02-24
categories: blog
---

# VOX Lab Prototype: Music Meets Science

Today launches VOX, a prototype vocal analysis system bridging music technology and pedagogy. Built as a local-first tool, it isolates vocal tracks from mixed audio and measures pitch, loudness, and dynamics—turning subjective perception into quantifiable data.

## How It Works
VOX operates with a clean separation of concerns:

- **Frontend**: A static site hosted on GitHub Pages, offering drag-and-drop audio upload, real-time pitch curve visualization via Chart.js, and metrics display (min, max, avg pitch in Hz and musical notes).

- **Backend**: A local FastAPI server running Demucs CNN for vocal stem separation, ensuring analysis focuses purely on the singer's voice. Pitch extraction uses Librosa’s pyin for fundamental frequency detection, with loudness calculated from RMS energy.

- **Pipeline**: Upload mixed audio → Demucs separation (isolates vocals.wav) → Librosa analysis on vocal stem only → Chart.js renders time-aligned pitch curves → Database logs sessions.

## Scientific Integrity
In strict scientific mode, pitch data comes raw from Librosa—no smoothing, no interpolation, no synthetic ramps. Unvoiced frames are filtered out, stats computed directly from voiced values. This ensures accurate representation of vocal dynamics.

## Why It Matters for Vocal Pedagogy
Traditional teaching relies on ear and experience. VOX provides objective metrics: pitch range, note mapping, dynamic range—enabling structured techniques for voice training. For songs like "Rolling in the Deep," it quantifies Adele's breath control or pitch bends.

It's not a critic; it's a mirror for voices. Future iterations will build on this foundation—interactive dashboards, MIDI export for training aids, or comparative analyses.

For now, VOX runs locally, keeping data private and computations deterministic. Test it: Upload a recording, watch the science unfold.