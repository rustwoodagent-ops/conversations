(() => {
  const pickVoice = () => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;

    const preferred = [
      /onyx/i,
      /male/i,
      /daniel/i,
      /google uk english male/i,
      /alex/i
    ];

    for (const pattern of preferred) {
      const found = voices.find(v => pattern.test(v.name));
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

  const initPlayer = (panel) => {
    const readBtn = panel.querySelector('.btn-read-aloud');
    const stopBtn = panel.querySelector('.btn-stop-aloud');
    const audioEl = panel.querySelector('audio');
    const article = panel.parentElement?.querySelector('article');
    const text = buildText(article);

    if (audioEl) {
      const applySpeed = () => {
        audioEl.defaultPlaybackRate = 1.1;
        audioEl.playbackRate = 1.1;
      };
      applySpeed();
      audioEl.addEventListener('loadedmetadata', applySpeed);
      audioEl.addEventListener('play', () => {
        if (audioEl.playbackRate !== 1.1) audioEl.playbackRate = 1.1;
      });
    }

    if (readBtn) {
      readBtn.addEventListener('click', () => {
        // Prefer the embedded MP3 so voice is consistent with the player.
        if (audioEl) {
          if ('speechSynthesis' in window) speechSynthesis.cancel();
          audioEl.currentTime = 0;
          audioEl.play().catch(() => {});
          return;
        }

        // Fallback: browser speech synthesis only if no audio file exists.
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
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (audioEl) {
          audioEl.pause();
          audioEl.currentTime = 0;
        }
        if ('speechSynthesis' in window) speechSynthesis.cancel();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const players = document.querySelectorAll('.blog-audio-player');
    players.forEach(initPlayer);

    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  });
})();
