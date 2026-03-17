(() => {
  'use strict';

  const ROOT = window.location.pathname.includes('/pages/') ? '..' : '.';
  let postsCache = null;

  async function loadPosts() {
    if (postsCache) return postsCache;
    const manifestRes = await fetch(`${ROOT}/posts/index.json`, { cache: 'no-store' });
    if (!manifestRes.ok) throw new Error('Manifest unavailable');
    const files = await manifestRes.json();
    const loaded = await Promise.all(files.map(async (file) => {
      try {
        const res = await fetch(`${ROOT}/posts/${file}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const post = await res.json();
        return normalizePost(post);
      } catch {
        return null;
      }
    }));
    postsCache = loaded.filter(Boolean).sort((a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01'));
    return postsCache;
  }

  function normalizePost(post) {
    let url = post.url || '#';
    // Ensure URLs are absolute paths (prefix with /pages/ if relative)
    if (url && !url.startsWith('/') && !url.startsWith('http')) {
      url = '/pages/' + url;
    }
    return {
      ...post,
      summary: post.summary || post.excerpt || '',
      tags: Array.isArray(post.tags) ? post.tags : [],
      url: url
    };
  }

  function pathOnly(url) {
    try {
      return new URL(url, window.location.origin).pathname;
    } catch {
      return url;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderTicker(posts) {
    const mount = document.querySelector('[data-news-ticker]');
    if (!mount || !posts.length) return;
    const items = posts.slice(0, 10).map((post) => `
      <a class="nh-ticker-item" href="${post.url}">
        <span class="nh-ticker-bullet"></span>
        <span class="nh-ticker-label">${escapeHtml(post.title)}</span>
      </a>
    `).join('');
    mount.innerHTML = `
      <div class="nh-ticker-shell">
        <div class="nh-ticker-kicker">Latest</div>
        <div class="nh-ticker-marquee">
          <div class="nh-ticker-track">${items}${items}</div>
        </div>
      </div>
    `;
  }

  function scoreRelated(current, candidate) {
    if (!current) return 0;
    let score = 0;
    const currentTags = new Set((current.tags || []).map((t) => String(t).toLowerCase()));
    for (const tag of (candidate.tags || [])) {
      if (currentTags.has(String(tag).toLowerCase())) score += 3;
    }
    if ((current.type || '') === (candidate.type || '')) score += 2;
    if ((candidate.title || '').toLowerCase().includes('howard')) score += 1;
    return score;
  }

  function renderRelated(posts) {
    if (document.body.dataset.page !== 'post') return;
    const article = document.querySelector('article.data-cell');
    if (!article) return;

    const currentPath = window.location.pathname;
    const current = posts.find((post) => pathOnly(post.url) === currentPath);
    const related = posts
      .filter((post) => pathOnly(post.url) !== currentPath)
      .map((post) => ({ post, score: scoreRelated(current, post) }))
      .sort((a, b) => b.score - a.score || new Date(b.post.date || '1970-01-01') - new Date(a.post.date || '1970-01-01'))
      .slice(0, 3)
      .map(({ post }) => post);

    if (!related.length) return;

    const section = document.createElement('section');
    section.className = 'hc-related';
    section.innerHTML = `
      <div class="hc-related-head">
        <span class="hc-related-kicker">Continue reading</span>
        <h2 class="hc-related-title">More from Howard</h2>
      </div>
      <div class="hc-related-grid">
        ${related.map((post) => `
          <a href="${post.url}" class="hc-related-card">
            <div class="hc-related-meta">
              <span>${escapeHtml(post.type || 'Dispatch')}</span>
              <span>•</span>
              <span>${formatDate(post.date)}</span>
            </div>
            <h3 class="hc-related-card-title">${escapeHtml(post.title)}</h3>
            <p class="hc-related-copy">${escapeHtml(post.summary)}</p>
            <span class="hc-related-link">Read article →</span>
          </a>
        `).join('')}
      </div>
    `;
    article.insertAdjacentElement('afterend', section);
  }

  function renderQuickListen(posts) {
    const mount = document.getElementById('quickListen');
    if (!mount) return;
    const withAudio = posts.filter((post) => post.audio_slug).slice(0, 4);
    if (!withAudio.length) return;
    mount.innerHTML = withAudio.map((post) => `
      <div class="nh-audio-card">
        <a href="${post.url}" class="nh-audio-link">
          <div class="nh-mini-meta">${formatDate(post.date)}</div>
          <h4 class="nh-mini-title">${escapeHtml(post.title)}</h4>
        </a>
        <div class="blog-audio-player nh-audio-enhanced" data-audio-slug="${escapeHtml(post.audio_slug)}">
          <h3>🎧 Quick Listen</h3>
          <audio controls preload="none">
            <source src="/assets/audio/${encodeURIComponent(post.audio_slug)}.wav" type="audio/wav">
          </audio>
        </div>
      </div>
    `).join('');

    if (window.HowardBlogAudioInit) {
      mount.querySelectorAll('.blog-audio-player').forEach((panel) => window.HowardBlogAudioInit(panel));
    }
  }

  async function init() {
    try {
      const posts = await loadPosts();
      renderTicker(posts);
      renderQuickListen(posts);
      renderRelated(posts);
    } catch (err) {
      console.error('News enhancements failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();