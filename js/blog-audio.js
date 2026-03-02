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
    const article = panel.parentElement?.querySelector('article');
    const text = buildText(article);

    if (readBtn) {
      readBtn.addEventListener('click', () => {
        if (!('speechSynthesis' in window) || !text) return;
        speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.97;
        utter.pitch = 0.92;
        utter.lang = 'en-AU';

        const voice = pickVoice();
        if (voice) utter.voice = voice;

        speechSynthesis.speak(utter);
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
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
