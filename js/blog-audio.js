(() => {
  const injectStyles = () => {
    if (document.getElementById('howard-audio-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'howard-audio-ui-styles';
    style.textContent = `
      .blog-audio-player.ha-modern {
        border: 1px solid var(--glass-border);
        background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
        border-radius: var(--radius-lg);
        padding: 1rem;
      }
      .ha-head { display:flex; align-items:center; justify-content:space-between; gap:.8rem; margin-bottom:.65rem; }
      .ha-title { margin:0; font-size:.98rem; font-weight:700; letter-spacing:.01em; }
      .ha-chip {
        font-size:.68rem; text-transform:uppercase; letter-spacing:.14em;
        color: var(--neon-cyan); border:1px solid rgba(0,212,255,.35);
        border-radius: 999px; padding:.2rem .5rem;
      }
      .ha-controls { display:grid; grid-template-columns:auto 1fr auto; gap:.75rem; align-items:center; }
      .ha-play {
        width:42px; height:42px; border-radius:999px; border:1px solid rgba(0,212,255,.35);
        background: rgba(0,212,255,.1); color: var(--text-primary); cursor:pointer;
        display:inline-flex; align-items:center; justify-content:center;
        transition: .2s transform, .2s box-shadow, .2s background;
      }
      .ha-play:hover { transform: translateY(-1px); box-shadow: 0 0 20px rgba(0,212,255,.18); }
      .ha-play svg { width:16px; height:16px; }
      .ha-play .ha-pause { display:none; }
      .ha-modern.is-playing .ha-play .ha-playicon { display:none; }
      .ha-modern.is-playing .ha-play .ha-pause { display:block; }
      .ha-wave { display:flex; align-items:center; gap:4px; min-height:20px; }
      .ha-wave span {
        width:4px; border-radius:999px; background: linear-gradient(180deg,var(--neon-cyan), var(--neon-purple));
        animation: haPulse 1.1s ease-in-out infinite alternate; animation-play-state: paused; opacity:.55;
      }
      .ha-modern.is-playing .ha-wave span { animation-play-state: running; opacity:1; }
      .ha-wave span:nth-child(1){height:9px;animation-delay:.0s}
      .ha-wave span:nth-child(2){height:15px;animation-delay:.1s}
      .ha-wave span:nth-child(3){height:21px;animation-delay:.2s}
      .ha-wave span:nth-child(4){height:13px;animation-delay:.3s}
      .ha-wave span:nth-child(5){height:18px;animation-delay:.4s}
      .ha-wave span:nth-child(6){height:11px;animation-delay:.5s}
      .ha-time { font-size:.8rem; color:var(--text-muted); font-variant-numeric: tabular-nums; }
      .ha-progress-wrap { margin-top:.75rem; }
      .ha-progress {
        width:100%; appearance:none; height:7px; border-radius:999px;
        background: rgba(255,255,255,.12); outline:none;
      }
      .ha-progress::-webkit-slider-thumb {
        appearance:none; width:14px; height:14px; border-radius:999px; cursor:pointer;
        border:1px solid rgba(0,212,255,.6); background:#0a141f;
        box-shadow: 0 0 0 2px rgba(0,212,255,.25);
      }
      .ha-meta { margin-top:.55rem; font-size:.78rem; color: var(--text-muted); }
      .ha-fallbacks { margin-top:.55rem; display:flex; gap:.45rem; flex-wrap:wrap; }
      .ha-fallbacks button { font-size:.74rem; padding:.35rem .55rem; }
      .ha-native { display:none; }
      @keyframes haPulse { from { transform:scaleY(.45); } to { transform:scaleY(1); } }
    `;

    document.head.appendChild(style);
  };

  const pickVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    const preferred = [/onyx/i, /male/i, /daniel/i, /google uk english male/i, /alex/i];
    for (const pattern of preferred) {
      const found = voices.find((v) => pattern.test(v.name));
      if (found) return found;
    }
    return voices[0] || null;
  };

  const buildText = (article) => {
    if (!article) return '';
    const bits = [];
    article.querySelectorAll('h1,h2,h3,p,li').forEach((el) => {
      const t = (el.textContent || '').trim();
      if (t) bits.push(t);
    });
    return bits.join('. ');
  };

  const fmt = (sec) => {
    if (!Number.isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const initPlayer = (panel) => {
    const audioEl = panel.querySelector('audio');
    if (!audioEl) return;

    const article = panel.parentElement?.querySelector('article');
    const text = buildText(article);

    audioEl.classList.add('ha-native');
    audioEl.controls = false;
    audioEl.preload = 'metadata';
    audioEl.defaultPlaybackRate = 1.1;
    audioEl.playbackRate = 1.1;

    panel.classList.add('ha-modern');

    const title = panel.querySelector('h3')?.textContent?.trim() || 'Listen to this post';
    const ui = document.createElement('div');
    ui.innerHTML = `
      <div class="ha-head">
        <h3 class="ha-title">${title}</h3>
        <span class="ha-chip">Now Playing</span>
      </div>
      <div class="ha-controls">
        <button class="ha-play" type="button" aria-label="Play audio">
          <svg class="ha-playicon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="ha-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
        </button>
        <div class="ha-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <span class="ha-time">0:00 / 0:00</span>
      </div>
      <div class="ha-progress-wrap">
        <input class="ha-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek audio" />
      </div>
      <div class="ha-fallbacks">
        <button class="btn btn-secondary btn-read-aloud" type="button">Replay</button>
        <button class="btn btn-ghost btn-stop-aloud" type="button">Stop</button>
      </div>
      <p class="ha-meta">Streaming post narration · Enhanced player UI</p>
    `;

    const oldNodes = [...panel.children].filter((n) => n !== audioEl);
    oldNodes.forEach((n) => n.remove());
    panel.prepend(ui);
    panel.appendChild(audioEl);

    const playBtn = panel.querySelector('.ha-play');
    const progress = panel.querySelector('.ha-progress');
    const timeEl = panel.querySelector('.ha-time');
    const replayBtn = panel.querySelector('.btn-read-aloud');
    const stopBtn = panel.querySelector('.btn-stop-aloud');

    const refresh = () => {
      const cur = audioEl.currentTime || 0;
      const dur = audioEl.duration || 0;
      const ratio = dur ? cur / dur : 0;
      progress.value = String(Math.round(ratio * 1000));
      timeEl.textContent = `${fmt(cur)} / ${fmt(dur)}`;
      if (audioEl.playbackRate !== 1.1) audioEl.playbackRate = 1.1;
    };

    playBtn.addEventListener('click', () => {
      if (audioEl.paused) {
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        audioEl.play().catch(() => {});
      } else {
        audioEl.pause();
      }
    });

    progress.addEventListener('input', () => {
      const dur = audioEl.duration || 0;
      if (!dur) return;
      audioEl.currentTime = (Number(progress.value) / 1000) * dur;
    });

    replayBtn?.addEventListener('click', () => {
      if (audioEl) {
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
        return;
      }
      if (!('speechSynthesis' in window) || !text) return;
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.1;
      utter.pitch = 0.92;
      utter.lang = 'en-AU';
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      speechSynthesis.speak(utter);
    });

    stopBtn?.addEventListener('click', () => {
      audioEl.pause();
      audioEl.currentTime = 0;
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      refresh();
    });

    audioEl.addEventListener('play', () => panel.classList.add('is-playing'));
    audioEl.addEventListener('pause', () => panel.classList.remove('is-playing'));
    audioEl.addEventListener('ended', () => {
      panel.classList.remove('is-playing');
      audioEl.currentTime = 0;
      refresh();
    });
    audioEl.addEventListener('timeupdate', refresh);
    audioEl.addEventListener('loadedmetadata', refresh);

    refresh();
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    const players = document.querySelectorAll('.blog-audio-player');
    players.forEach(initPlayer);

    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  });
})();
