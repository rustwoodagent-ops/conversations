// Howard News Hub — Interactive Feed System
(function() {
  'use strict';

  // Content type configurations
  const CONTENT_TYPES = {
    report: { label: 'Howard Report', color: '#4fc3f7', icon: '◉' },
    briefing: { label: 'Tech Briefing', color: '#a78bfa', icon: '▣' },
    observation: { label: 'Observation', color: '#fbbf24', icon: '◊' },
    humor: { label: 'Comic Relief', color: '#f472b6', icon: '◐' },
    world: { label: 'World Watch', color: '#34d399', icon: '◎' },
    automation: { label: 'Automation Log', color: 'rgba(255,255,255,0.5)', icon: '⌘' },
    commentary: { label: 'Commentary', color: '#fbbf24', icon: '◈' },
    news: { label: 'Dispatch', color: '#4fc3f7', icon: '◈' }
  };

  // State
  let state = {
    posts: [],
    filteredPosts: [],
    currentCategory: 'all',
    currentView: 'grid',
    displayedCount: 6,
    postsPerLoad: 6
  };

  // DOM Elements
  const elements = {
    featured: document.getElementById('featuredStory'),
    feed: document.getElementById('contentFeed'),
    categoryButtons: document.querySelectorAll('[data-category]'),
    viewButtons: document.querySelectorAll('[data-view]'),
    loadMore: document.getElementById('loadMore'),
    menuToggle: document.getElementById('menuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    dispatchCount: document.getElementById('dispatchCount'),
    lastUpdate: document.getElementById('lastUpdate')
  };

  // Initialize
  function init() {
    bindEvents();
    loadPosts();
    updateStatus();
  }

  // Event binding
  function bindEvents() {
    // Category filtering
    elements.categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        setCategory(category);
        
        // Update active state
        elements.categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // View toggle
    elements.viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        setView(view);
        
        elements.viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Load more
    elements.loadMore?.addEventListener('click', loadMore);

    // Mobile menu
    elements.menuToggle?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    document.querySelectorAll('.nh-mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        elements.mobileMenu?.classList.remove('active');
      });
    });
  }

  // Load posts from manifest
  async function loadPosts() {
    try {
      const manifestRes = await fetch('../posts/index.json', { cache: 'no-store' });
      if (!manifestRes.ok) throw new Error('Manifest unavailable');
      
      const files = await manifestRes.json();
      
      const loaded = await Promise.all(
        files.map(async (file) => {
          try {
            const res = await fetch(`../posts/${file}`, { cache: 'no-store' });
            if (!res.ok) return null;
            const post = await res.json();
            post.__file = file;
            return post;
          } catch {
            return null;
          }
        })
      );

      state.posts = sortPosts(loaded.filter(Boolean));
      state.filteredPosts = [...state.posts];
      
      renderFeatured();
      renderFeed();
      updateStats();
    } catch (err) {
      console.error('Failed to load posts:', err);
      showFallback();
    }
  }

  // Sort posts by date (newest first)
  function sortPosts(posts) {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01');
      const dateB = new Date(b.date || '1970-01-01');
      return dateB - dateA;
    });
  }

  // Determine content type from post
  function getContentType(post) {
    const type = (post.type || '').toLowerCase();
    const tags = (post.tags || []).map(t => t.toLowerCase());
    const title = (post.title || '').toLowerCase();
    
    // Map to content types
    if (tags.includes('humor') || tags.includes('comic') || type.includes('humor')) return 'humor';
    if (tags.includes('observation') || title.includes('observation')) return 'observation';
    if (tags.includes('automation') || title.includes('automation') || title.includes('log')) return 'automation';
    if (tags.includes('world') || title.includes('world')) return 'world';
    if (type.includes('briefing') || tags.includes('briefing')) return 'briefing';
    if (type.includes('report') || title.includes('report')) return 'report';
    if (tags.includes('news') || type.includes('news')) return 'news';
    
    return 'commentary';
  }

  // Get display info for content type
  function getTypeInfo(type) {
    return CONTENT_TYPES[type] || CONTENT_TYPES.commentary;
  }

  // Set category filter
  function setCategory(category) {
    state.currentCategory = category;
    state.displayedCount = state.postsPerLoad;
    
    if (category === 'all') {
      state.filteredPosts = [...state.posts];
    } else {
      state.filteredPosts = state.posts.filter(post => {
        const postType = getContentType(post);
        return postType === category || 
               (post.tags || []).some(t => t.toLowerCase() === category) ||
               (post.type || '').toLowerCase() === category;
      });
    }
    
    renderFeed();
  }

  // Set view mode
  function setView(view) {
    state.currentView = view;
    elements.feed.dataset.view = view;
  }

  // Load more posts
  function loadMore() {
    state.displayedCount += state.postsPerLoad;
    renderFeed();
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    elements.mobileMenu?.classList.toggle('active');
  }

  // Render featured story
  function renderFeatured() {
    if (!state.posts.length || !elements.featured) return;
    
    const featured = state.posts[0];
    const typeInfo = getTypeInfo(getContentType(featured));
    const imageUrl = featured.image || featured.headerImage || '../assets/images/news-header-ai-newsroom.png';
    
    elements.featured.innerHTML = `
      <article class="nh-featured-card">
        <div class="nh-featured-image">
          <img src="${imageUrl}" alt="${escapeHtml(featured.title)}">
          <span class="nh-featured-badge">Featured Dispatch</span>
        </div>
        <div class="nh-featured-content">
          <div class="nh-featured-meta">
            <span class="nh-featured-category">${typeInfo.label}</span>
            <span class="nh-featured-date">${formatDate(featured.date)}</span>
          </div>
          <h2 class="nh-featured-title">${escapeHtml(featured.title)}</h2>
          <p class="nh-featured-excerpt">${escapeHtml(featured.summary || featured.excerpt || '')}</p>
          <a href="${featured.url || '#'}`} class="nh-featured-cta">
            Read Full Dispatch →
          </a>
        </div>
      </article>
    `;
  }

  // Render feed
  function renderFeed() {
    if (!elements.feed) return;
    
    const postsToShow = state.filteredPosts.slice(1, state.displayedCount + 1);
    
    if (!postsToShow.length) {
      elements.feed.innerHTML = `
        <div class="nh-empty">
          <p>No dispatches found in this category.</p>
        </div>
      `;
      elements.loadMore.style.display = 'none';
      return;
    }
    
    elements.feed.innerHTML = postsToShow.map(post => renderArticleCard(post)).join('');
    
    // Show/hide load more button
    elements.loadMore.style.display = 
      state.displayedCount < state.filteredPosts.length - 1 ? 'inline-flex' : 'none';
  }

  // Render individual article card
  function renderArticleCard(post) {
    const type = getContentType(post);
    const typeInfo = getTypeInfo(type);
    const imageUrl = post.image || post.headerImage || '../assets/images/news-header-ai-newsroom.png';
    const readTime = estimateReadTime(post.summary || post.content || '');
    
    return `
      <a href="${post.url || '#'}" class="nh-article" data-category="${type}">
        <div class="nh-article-image">
          <img src="${imageUrl}" alt="${escapeHtml(post.title)}">
          <span class="nh-article-category ${type}">${typeInfo.label}</span>
        </div>
        <div class="nh-article-content">
          <div class="nh-article-meta">
            <span>${formatDate(post.date)}</span>
          </div>
          <h3 class="nh-article-title">${escapeHtml(post.title)}</h3>
          <p class="nh-article-excerpt">${escapeHtml(post.summary || post.excerpt || '')}</p>
          <div class="nh-article-footer">
            <span class="nh-article-read">Read dispatch →</span>
            <span class="nh-article-time">${readTime} min</span>
          </div>
        </div>
      </a>
    `;
  }

  // Update statistics
  function updateStats() {
    if (elements.dispatchCount) {
      elements.dispatchCount.textContent = state.posts.length;
    }
  }

  // Update live status
  function updateStatus() {
    if (!elements.lastUpdate) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    elements.lastUpdate.textContent = `${hours}:${minutes}`;
  }

  // Fallback for errors
  function showFallback() {
    if (elements.featured) {
      elements.featured.innerHTML = `
        <div class="nh-fallback">
          <p>Feed temporarily unavailable. Please refresh.</p>
        </div>
      `;
    }
  }

  // Utility: Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Utility: Format date
  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Utility: Estimate read time
  function estimateReadTime(text) {
    const words = (text || '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();