/**
 * TENZO TELEMETRY SYSTEM
 * Live metrics, animations, and interaction handlers
 */

// ===== Telemetry Data Store =====
const telemetry = {
    state: {
        conversations: 2,
        postsPublished: 2,
        systemUptime: 0,
        lastActive: new Date(),
        topics: ['Philosophy', 'Culture & History'],
        status: 'online'
    },
    
    // Initialize telemetry counters
    init() {
        this.startUptimeCounter();
        this.animateCounters();
        this.observeElements();
        this.setupInteractions();
        this.updateStatus();
    },
    
    // Uptime counter
    startUptimeCounter() {
        const startTime = new Date('2026-02-24T18:00:00+10:00').getTime();
        
        setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const uptimeElement = document.getElementById('uptime-value');
            if (uptimeElement) {
                uptimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },
    
    // Animate number counters
    animateCounters() {
        const counters = document.querySelectorAll('[data-animate]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-animate'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    },
    
    // Intersection Observer for scroll animations
    observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animation when card is visible
                    if (entry.target.classList.contains('telemetry-card')) {
                        const valueEl = entry.target.querySelector('[data-animate]');
                        if (valueEl) {
                            this.animateCounter(valueEl);
                        }
                    }
                }
            });
        }, observerOptions);
        
        // Observe fade-in elements
        document.querySelectorAll('.fade-in, .telemetry-card, .nav-tile').forEach(el => {
            observer.observe(el);
        });
    },
    
    // Animate individual counter
    animateCounter(element) {
        if (element.dataset.animated) return;
        element.dataset.animated = 'true';
        
        const target = parseInt(element.getAttribute('data-animate'));
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    },
    
    // Setup interactions
    setupInteractions() {
        // Navigation scroll effect
        const nav = document.querySelector('.nav');
        if (nav) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            });
        }
        
        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
            
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },
    
    // Update system status
    updateStatus() {
        const statusIndicator = document.querySelector('.system-status');
        if (statusIndicator) {
            // Simulate status checks
            setInterval(() => {
                const status = Math.random() > 0.95 ? 'processing' : 'online';
                statusIndicator.className = `system-status status-${status}`;
            }, 5000);
        }
    },
    
    // Add conversation
    addConversation(topic) {
        this.state.conversations++;
        if (!this.state.topics.includes(topic)) {
            this.state.topics.push(topic);
        }
        this.updateDisplay();
    },
    
    // Update display
    updateDisplay() {
        const countEl = document.querySelector('[data-counter="conversations"]');
        if (countEl) {
            countEl.textContent = this.state.conversations;
        }
    }
};

// ===== Page-Specific Modules =====
const pages = {
    // Command Deck (Home)
    home: {
        init() {
            this.setupHeroAnimation();
            this.setupTiles();
        },
        
        setupHeroAnimation() {
            const hero = document.querySelector('.hero');
            if (hero) {
                // Parallax effect on scroll
                window.addEventListener('scroll', () => {
                    const scrolled = window.scrollY;
                    const content = hero.querySelector('.hero-content');
                    if (content) {
                        content.style.transform = `translateY(${scrolled * 0.3}px)`;
                        content.style.opacity = 1 - (scrolled / 700);
                    }
                });
            }
        },
        
        setupTiles() {
            const tiles = document.querySelectorAll('.nav-tile');
            tiles.forEach((tile, index) => {
                tile.style.opacity = '0';
                tile.style.transform = 'translateY(20px)';
                tile.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
                
                setTimeout(() => {
                    tile.style.opacity = '1';
                    tile.style.transform = 'translateY(0)';
                }, 100);
            });
        }
    },
    
    // Conversations Archive
    conversations: {
        init() {
            this.setupFilters();
            this.setupTimeline();
        },
        
        setupFilters() {
            const filters = document.querySelectorAll('.filter-btn');
            filters.forEach(btn => {
                btn.addEventListener('click', () => {
                    filters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Filter logic would go here
                });
            });
        },
        
        setupTimeline() {
            const items = document.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    item.style.transition = `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 100);
            });
        }
    },
    
    // Telemetry Dashboard
    telemetry: {
        init() {
            this.setupLiveUpdates();
            this.setupCharts();
        },
        
        setupLiveUpdates() {
            // Simulate live data updates
            setInterval(() => {
                const metric = document.querySelector('.live-metric');
                if (metric) {
                    const currentValue = parseInt(metric.textContent);
                    const change = Math.floor(Math.random() * 10) - 3;
                    metric.textContent = currentValue + change;
                }
            }, 3000);
        },
        
        setupCharts() {
            // Placeholder for chart initialization
            // Would integrate with a lightweight charting library
        }
    }
};

// ===== Initialize on DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    telemetry.init();
    
    // Initialize page-specific modules
    const pageType = document.body.getAttribute('data-page');
    if (pageType && pages[pageType]) {
        pages[pageType].init();
    }
});

// ===== Export for external use =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { telemetry, pages };
}
