(() => {
  const root = document.querySelector('[data-feed-root]');
  if (!root) return;

  const listEl = root.querySelector('[data-feed-list]');
  const filtersEl = root.querySelector('[data-feed-filters]');
  const manifestPath = root.dataset.feedManifest || 'posts/index.json';
  const postsBase = root.dataset.postsBase || 'posts';
  const templatePath = root.dataset.postTemplate || 'templates/post-template.html';

  let posts = [];

  const esc = (value = '') => String(value)
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;');

  const asDotDate = (date = '') => String(date).split('-').join('.');

  function sortNewestFirst(items) {
    return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function postUrl(file, directUrl) {
    if (directUrl) {
      if (/^https?:\/\//i.test(directUrl) || directUrl.startsWith('/')) return directUrl;
      const inPagesDir = window.location.pathname.includes('/pages/');
      return inPagesDir ? directUrl : `pages/${directUrl}`;
    }
    return `${templatePath}?post=${encodeURIComponent(file)}`;
  }

  function render(items) {
    if (!listEl) return;

    listEl.innerHTML = items.map((post) => {
      const tags = (post.tags || []).map((t) => `<span class="feed-tag">${esc(t)}</span>`).join('');
      const category = (post.tags || [post.type || 'log'])[0] || 'log';
      const articleUrl = postUrl(post.__file || '', post.url || '');

      return `
        <article class="feed-entry" data-category="${esc(category.toLowerCase())}">
          <div class="feed-meta">
            <span>[${esc(post.type || 'TRANSMISSION')}]</span>
            <span>${esc(asDotDate(post.date))}</span>
            <span>SOURCE: ${esc((post.author || 'HOWARD').toUpperCase())}</span>
            ${tags}
          </div>
          <h3 class="feed-title cursor">${esc(post.title || 'Untitled transmission')}</h3>
          <p class="feed-excerpt">${esc(post.summary || '')}</p>
          <p class="feed-command-inline">STATUS: SIGNAL VERIFIED</p>
          <div class="feed-actions">
            <a href="${articleUrl}">open transmission</a>
            <button type="button" data-share="${esc(new URL(articleUrl, window.location.href).toString())}">share link</button>
            <span class="feed-tag">${esc(category)}</span>
          </div>
          <p class="feed-command-inline">howard@rustwoodstudio:~$ open transmission</p>
        </article>
      `;
    }).join('');

    listEl.querySelectorAll('[data-share]').forEach((button) => {
      button.addEventListener('click', async () => {
        const url = button.getAttribute('data-share');
        try {
          if (navigator.share) {
            await navigator.share({ url });
            return;
          }
          await navigator.clipboard.writeText(url);
          const original = button.textContent;
          button.textContent = 'link copied';
          setTimeout(() => (button.textContent = original), 1200);
        } catch {
          // ignore
        }
      });
    });
  }

  function applyFilter(filter) {
    if (filter === 'all') return render(posts);
    const f = String(filter).toLowerCase();
    render(posts.filter((p) => {
      const hay = [p.type, ...(p.tags || [])].join(' ').toLowerCase();
      return hay.includes(f);
    }));
  }

  async function loadPosts() {
    try {
      const manifestRes = await fetch(manifestPath, { cache: 'no-store' });
      if (!manifestRes.ok) throw new Error('manifest unavailable');
      const files = await manifestRes.json();

      const loaded = await Promise.all((files || []).map(async (file) => {
        const res = await fetch(`${postsBase}/${file}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const post = await res.json();
        post.__file = file;
        return post;
      }));

      posts = sortNewestFirst(loaded.filter(Boolean));
      if (posts.length) {
        render(posts);
        return;
      }
      throw new Error('no posts loaded');
    } catch {
      const fallbackPath = root.dataset.feedFallback || manifestPath.replace('posts/index.json', 'data/feed.json');
      const res = await fetch(fallbackPath, { cache: 'no-store' });
      if (!res.ok) throw new Error('fallback unavailable');
      const fallbackPosts = await res.json();
      posts = sortNewestFirst((fallbackPosts || []).map((p) => ({
        date: p.date || p.publishedAt || '',
        type: p.type || 'TRANSMISSION',
        title: p.title || 'Untitled transmission',
        author: p.author || 'HOWARD',
        summary: p.summary || p.excerpt || '',
        content: p.content || '',
        tags: p.tags || [p.category || 'log'],
        url: p.url || ''
      })));
      render(posts);
    }
  }

  filtersEl?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-filter]');
    if (!btn) return;
    filtersEl.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    applyFilter(btn.dataset.filter || 'all');
  });

  window.addEventListener('scroll', () => {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${progress}%`;
  });

  loadPosts().catch(() => {
    if (listEl) {
      listEl.innerHTML = '<article class="feed-entry"><p class="feed-excerpt">Feed unavailable. Refresh shortly.</p></article>';
    }
  });
})();
