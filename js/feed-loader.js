(() => {
  const root = document.querySelector('[data-feed-root]');
  if (!root) return;

  const listEl = root.querySelector('[data-feed-list]');
  const filtersEl = root.querySelector('[data-feed-filters]');
  let allPosts = [];
  let activeFilter = 'all';

  function escapeHtml(value = '') {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function render(posts) {
    if (!listEl) return;

    listEl.innerHTML = posts.map((post) => {
      const tags = (post.tags || []).slice(0, 3).map((t) => `<span class="feed-tag">${escapeHtml(t)}</span>`).join('');
      const href = `${post.url}`;
      const shareUrl = new URL(href, window.location.href).toString();

      return `
        <article class="feed-entry fade-in" data-category="${escapeHtml(post.category || 'uncategorised')}">
          <div class="feed-meta">
            <span>[MISSION LOG]</span>
            <span>DATE: ${escapeHtml(post.date || 'N/A')}</span>
            <span>SOURCE: ${escapeHtml(post.source || 'HOWARD')}</span>
            <span>${escapeHtml(post.readTime || '')}</span>
            ${tags}
          </div>
          <h3 class="feed-title cursor">${escapeHtml(post.title)}</h3>
          <p class="feed-excerpt">${escapeHtml(post.excerpt)}</p>

          <div class="feed-actions">
            <a href="${href}">open transmission</a>
            <button type="button" data-share="${escapeHtml(shareUrl)}" data-title="${escapeHtml(post.title)}">share link</button>
            <span class="feed-tag">${escapeHtml(post.category || 'log')}</span>
          </div>

          <p class="feed-command-inline">rustwood@A9Max:~$ open transmission</p>
        </article>
      `;
    }).join('');

    listEl.querySelectorAll('[data-share]').forEach((button) => {
      button.addEventListener('click', async () => {
        const url = button.getAttribute('data-share');
        const title = button.getAttribute('data-title');

        try {
          if (navigator.share) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          button.textContent = 'link copied';
          setTimeout(() => { button.textContent = 'share link'; }, 1200);
        } catch {
          // Ignore share cancellation.
        }
      });
    });
  }

  function applyFilter(filter) {
    activeFilter = filter;
    const filtered = filter === 'all' ? allPosts : allPosts.filter((p) => p.category === filter);
    render(filtered);

    filtersEl?.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });
  }

  async function load() {
    try {
      const response = await fetch('../data/feed.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Feed unavailable');
      allPosts = await response.json();
      applyFilter('all');
    } catch {
      listEl.innerHTML = '<article class="feed-entry"><p class="feed-excerpt">Feed unavailable. Please refresh shortly.</p></article>';
    }
  }

  filtersEl?.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-filter]');
    if (!target) return;
    applyFilter(target.dataset.filter);
  });

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (scrolled / max) * 100 : 0;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = `${progress}%`;
  });

  load();
})();
