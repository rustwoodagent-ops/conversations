(() => {
  'use strict';

  const CONTENT_TYPES = {
    report: { label: 'Howard Report', tone: 'report' },
    briefing: { label: 'Tech Briefing', tone: 'briefing' },
    observation: { label: 'Observation', tone: 'observation' },
    humor: { label: 'Comic Relief', tone: 'humor' },
    world: { label: 'World Watch', tone: 'world' },
    automation: { label: 'Automation Log', tone: 'automation' },
    commentary: { label: 'Commentary', tone: 'commentary' },
    news: { label: 'Dispatch', tone: 'news' }
  };

  const state = {
    posts: [],
    filteredPosts: [],
    currentCategory: 'all',
    currentView: 'grid',
    displayedCount: 6,
    postsPerLoad: 6,
    heroCount: 4
  };

  const el = {
    featured: document.getElementById('featuredStory'),
    heroRail: document.getElementById('heroRail'),
    feed: document.getElementById('contentFeed'),
    trending: document.getElementById('trendingList'),
    quick: document.getElementById('quickUpdates'),
    thoughts: document.getElementById('thoughtsList'),
    categoryButtons: document.querySelectorAll('[data-category]'),
    viewButtons: document.querySelectorAll('[data-view]'),
    loadMore: document.getElementById('loadMore'),
    menuToggle: document.getElementById('menuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    dispatchCount: document.getElementById('dispatchCount'),
    lastUpdate: document.getElementById('lastUpdate')
  };

  function init() {
    bindEvents();
    updateStatus();
    loadPosts();
  }

  function bindEvents() {
    el.categoryButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category || 'all';
        setCategory(category);
        el.categoryButtons.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    el.viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view || 'grid';
        setView(view);
        el.viewButtons.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });

    el.loadMore?.addEventListener('click', loadMore);
    el.menuToggle?.addEventListener('click', () => el.mobileMenu?.classList.toggle('active'));
    document.querySelectorAll('.nh-mobile-link').forEach((link) => {
      link.addEventListener('click', () => el.mobileMenu?.classList.remove('active'));
    });
  }

  async function loadPosts() {
    try {
      const manifestRes = await fetch('../posts/index.json', { cache: 'no-store' });
      if (!manifestRes.ok) throw new Error('Manifest unavailable');
      const files = await manifestRes.json();

      const loaded = await Promise.all(files.map(async (file) => {
        try {
          const res = await fetch(`../posts/${file}`, { cache: 'no-store' });
          if (!res.ok) return null;
          const post = await res.json();
          post.__file = file;
          return normalizePost(post);
        } catch {
          return null;
        }
      }));

      state.posts = sortPosts(loaded.filter(Boolean));
      state.filteredPosts = [...state.posts];
      updateStats();
      renderAll();
    } catch (error) {
      console.error('Howard News Hub load error:', error);
      showFallback();
    }
  }

  function normalizePost(post) {
    const slug = post.slug || '';
    const summary = post.summary || post.excerpt || '';
    const headerImage = post.image || post.headerImage || inferImage(slug, post);
    return {
      ...post,
      summary,
      headerImage,
      contentType: getContentType(post)
    };
  }

  function inferImage(slug, post) {
    const map = [
      ['gemini', '../assets/images/news-gemini-pro.png'],
      ['github', '../assets/images/news-github-codex.png'],
      ['copilot', '../assets/images/news-copilot-vs.png'],
      ['protein', '../assets/images/news-protein-ai.png'],
      ['openai', '../assets/images/news-dalle3.png'],
      ['news', '../assets/images/news-header-ai-newsroom.png'],
      ['daily-howard-update', '../assets/images/news-header-ai-newsroom.png']
    ];

    const lower = `${slug} ${(post.title || '').toLowerCase()}`;
    const hit = map.find(([key]) => lower.includes(key));
    return hit ? hit[1] : '../assets/images/2026-03-17-14-42-howard-news-hub-hero.png';
  }

  function sortPosts(posts) {
    return [...posts].sort((a, b) => {
      const dateCompare = new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01');
      if (dateCompare !== 0) return dateCompare;
      return (a.__file || '').localeCompare(b.__file || '') * -1;
    });
  }

  function getContentType(post) {
    const type = (post.type || '').toLowerCase();
    const tags = (post.tags || []).map((t) => t.toLowerCase());
    const title = (post.title || '').toLowerCase();

    if (tags.includes('humor') || tags.includes('comic') || title.includes('comic') || title.includes('joke')) return 'humor';
    if (tags.includes('observation') || title.includes('observation')) return 'observation';
    if (tags.includes('automation') || title.includes('automation') || title.includes('log')) return 'automation';
    if (tags.includes('world') || title.includes('world')) return 'world';
    if (type.includes('briefing') || tags.includes('briefing') || title.includes('briefing')) return 'briefing';
    if (type.includes('report') || title.includes('report')) return 'report';
    if (tags.includes('news') || type.includes('news') || title.includes('update')) return 'news';
    return 'commentary';
  }

  function getTypeInfo(type) {
    return CONTENT_TYPES[type] || CONTENT_TYPES.commentary;
  }

  function setCategory(category) {
    state.currentCategory = category;
    state.displayedCount = state.postsPerLoad;
    state.filteredPosts = category === 'all'
      ? [...state.posts]
      : state.posts.filter((post) => post.contentType === category);
    renderAll();
  }

  function setView(view) {
    state.currentView = view;
    if (el.feed) el.feed.dataset.view = view;
  }

  function loadMore() {
    state.displayedCount += state.postsPerLoad;
    renderFeed();
  }

  function renderAll() {
    renderHeroCluster();
    renderFeed();
    renderSidebar();
  }

  function renderHeroCluster() {
    const posts = state.filteredPosts;
    if (!posts.length) {
      if (el.featured) el.featured.innerHTML = '<div class="nh-fallback">No dispatches in this category yet.</div>';
      if (el.heroRail) el.heroRail.innerHTML = '';
      return;
    }

    const featured = posts[0];
    const secondary = posts.slice(1, 4);
    if (el.featured) el.featured.innerHTML = renderFeaturedCard(featured);
    if (el.heroRail) el.heroRail.innerHTML = secondary.map(renderSecondaryCard).join('');
  }

  function renderFeaturedCard(post) {
    const typeInfo = getTypeInfo(post.contentType);
    return `
      <article class="nh-featured-card">
        <div class="nh-featured-image">
          <img src="${escapeAttr(post.headerImage)}" alt="${escapeAttr(post.title)}">
          <span class="nh-featured-badge">Featured Story</span>
        </div>
        <div class="nh-featured-content">
          <div class="nh-featured-meta">
            <span class="nh-featured-category ${typeInfo.tone}">${typeInfo.label}</span>
            <span>${formatDate(post.date)}</span>
            <span>${estimateReadTime(post.summary)} min read</span>
          </div>
          <h2 class="nh-featured-title">${escapeHtml(post.title)}</h2>
          <p class="nh-featured-excerpt">${escapeHtml(post.summary)}</p>
          <a href="${escapeAttr(post.url || '#')}" class="nh-featured-cta">Read full dispatch →</a>
        </div>
      </article>
    `;
  }

  function renderSecondaryCard(post) {
    const typeInfo = getTypeInfo(post.contentType);
    return `
      <a href="${escapeAttr(post.url || '#')}" class="nh-secondary-card">
        <div class="nh-secondary-media">
          <img src="${escapeAttr(post.headerImage)}" alt="${escapeAttr(post.title)}">
        </div>
        <div class="nh-secondary-content">
          <div class="nh-secondary-meta">
            <span class="nh-secondary-category ${typeInfo.tone}">${typeInfo.label}</span>
            <span>${formatDateCompact(post.date)}</span>
          </div>
          <h3 class="nh-secondary-title">${escapeHtml(post.title)}</h3>
          <span class="nh-secondary-read">Open story →</span>
        </div>
      </a>
    `;
  }

  function renderFeed() {
    if (!el.feed) return;

    const start = Math.min(state.heroCount, state.filteredPosts.length);
    const postsToShow = state.filteredPosts.slice(start, start + state.displayedCount);

    if (!postsToShow.length) {
      el.feed.innerHTML = '<div class="nh-empty">No further dispatches in this category yet.</div>';
      if (el.loadMore) el.loadMore.style.display = 'none';
      return;
    }

    el.feed.innerHTML = postsToShow.map(renderArticleCard).join('');

    if (el.loadMore) {
      const hasMore = start + state.displayedCount < state.filteredPosts.length;
      el.loadMore.style.display = hasMore ? 'inline-flex' : 'none';
    }
  }

  function renderArticleCard(post) {
    const typeInfo = getTypeInfo(post.contentType);
    return `
      <a href="${escapeAttr(post.url || '#')}" class="nh-article" data-category="${escapeAttr(post.contentType)}">
        <div class="nh-article-image">
          <img src="${escapeAttr(post.headerImage)}" alt="${escapeAttr(post.title)}">
          <span class="nh-article-category ${typeInfo.tone}">${typeInfo.label}</span>
        </div>
        <div class="nh-article-content">
          <div class="nh-article-meta">
            <span>${formatDate(post.date)}</span>
            <span>•</span>
            <span>${estimateReadTime(post.summary)} min read</span>
          </div>
          <h3 class="nh-article-title">${escapeHtml(post.title)}</h3>
          <p class="nh-article-excerpt">${escapeHtml(post.summary)}</p>
          <div class="nh-article-footer">
            <span class="nh-article-read">Read dispatch →</span>
            <span class="nh-article-time">${typeInfo.label}</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderSidebar() {
    if (el.trending) {
      const trending = state.filteredPosts.slice(1, 6);
      el.trending.innerHTML = trending.map((post, i) => `
        <a href="${escapeAttr(post.url || '#')}" class="nh-mini-link">
          <div class="nh-mini-meta">Trending ${String(i + 1).padStart(2, '0')}</div>
          <h4 class="nh-mini-title">${escapeHtml(post.title)}</h4>
        </a>
      `).join('') || '<div class="nh-empty">No trending items yet.</div>';
    }

    if (el.quick) {
      const quick = state.filteredPosts.slice(0, 4);
      el.quick.innerHTML = quick.map((post) => {
        const typeInfo = getTypeInfo(post.contentType);
        return `
          <a href="${escapeAttr(post.url || '#')}" class="nh-mini-link">
            <span class="nh-mini-pill">${typeInfo.label}</span>
            <h4 class="nh-mini-title">${escapeHtml(post.title)}</h4>
            <p class="nh-mini-copy">${escapeHtml(trimSummary(post.summary, 88))}</p>
          </a>
        `;
      }).join('');
    }

    if (el.thoughts) {
      const thoughts = state.filteredPosts.filter((post) => ['commentary', 'observation', 'humor'].includes(post.contentType)).slice(0, 3);
      const source = thoughts.length ? thoughts : state.filteredPosts.slice(0, 3);
      el.thoughts.innerHTML = source.map((post) => `
        <a href="${escapeAttr(post.url || '#')}" class="nh-mini-link">
          <div class="nh-mini-meta">Howard’s Note</div>
          <h4 class="nh-mini-title">${escapeHtml(post.title)}</h4>
          <p class="nh-mini-copy">${escapeHtml(trimSummary(post.summary, 110))}</p>
        </a>
      `).join('');
    }
  }

  function updateStats() {
    if (el.dispatchCount) el.dispatchCount.textContent = String(state.posts.length);
  }

  function updateStatus() {
    if (!el.lastUpdate) return;
    const now = new Date();
    el.lastUpdate.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function showFallback() {
    const message = '<div class="nh-fallback">Feed temporarily unavailable. Refresh shortly.</div>';
    if (el.featured) el.featured.innerHTML = message;
    if (el.heroRail) el.heroRail.innerHTML = '';
    if (el.feed) el.feed.innerHTML = '';
    if (el.trending) el.trending.innerHTML = '';
    if (el.quick) el.quick.innerHTML = '';
    if (el.thoughts) el.thoughts.innerHTML = '';
  }

  function trimSummary(text, limit) {
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatDateCompact(dateStr) {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function estimateReadTime(text) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();