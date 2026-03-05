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
            this.setupConsoleMonitor();
            this.setupTypedWelcome();
            this.setupCassettePlayer();
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
        },

        setupConsoleMonitor() {
            const timeEl = document.getElementById('heroConsoleTime');
            const dateEl = document.getElementById('heroConsoleDate');
            const latencyEl = document.getElementById('latencyValue');
            if (!timeEl && !dateEl && !latencyEl) return;

            const tick = () => {
                const now = new Date();
                if (timeEl) {
                    timeEl.textContent = now.toLocaleTimeString('en-AU', { hour12: false });
                }
                if (dateEl) {
                    dateEl.textContent = now.toLocaleDateString('en-AU', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }
                if (latencyEl) {
                    const ms = 28 + Math.floor(Math.random() * 36);
                    latencyEl.textContent = `${ms}ms`;
                }
            };

            tick();
            setInterval(tick, 1200);
        },

        setupTypedWelcome() {
            const el = document.getElementById('typedWelcome');
            if (!el) return;

            const lines = [
                'Welcome back, Azza. Howard is online.',
                'Command stack stable. Ready for next objective.',
                'Telemetry green. Systems go.'
            ];

            let lineIndex = 0;
            let charIndex = 0;
            let deleting = false;

            const run = () => {
                const full = lines[lineIndex];

                if (!deleting) {
                    charIndex += 1;
                    el.textContent = full.slice(0, charIndex);
                    if (charIndex >= full.length) {
                        deleting = true;
                        setTimeout(run, 1300);
                        return;
                    }
                    setTimeout(run, 45);
                } else {
                    charIndex -= 1;
                    el.textContent = full.slice(0, Math.max(0, charIndex));
                    if (charIndex <= 0) {
                        deleting = false;
                        lineIndex = (lineIndex + 1) % lines.length;
                        setTimeout(run, 240);
                        return;
                    }
                    setTimeout(run, 24);
                }
            };

            run();
        },

        setupCassettePlayer() {
            const el = document.getElementById('cassette');
            const audio = document.getElementById('howardIntroAudio');
            if (!el || !audio) return;

            const width = 67;
            const inner = width - 8;
            const barLen = 44;
            const speedMs = 90;
            const reel = ['|', '/', '-', '\\'];

            const midpad = (s) => (s.length > inner ? s.slice(0, inner) : s.padEnd(inner, ' '));
            const fmt = (n) => {
                if (!Number.isFinite(n)) return '00:00';
                const m = Math.floor(n / 60);
                const s = Math.floor(n % 60);
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            };

            const makeFrame = (tick) => {
                const playing = !audio.paused && !audio.ended;
                const L = playing ? reel[tick % 4] : 'o';
                const R = playing ? reel[(tick + 2) % 4] : 'o';
                const progress = audio.duration ? Math.min(1, Math.max(0, audio.currentTime / audio.duration)) : 0;
                const pos = Math.min(barLen - 1, Math.floor(progress * (barLen - 1)));
                const bar = '.'.repeat(pos) + 'o' + '.'.repeat(barLen - pos - 1);
                const reelBetween = ' '.repeat(Math.max(0, inner - (`(${L})`.length + `(${R})`.length)));
                const reelLine = `(${L})${reelBetween}(${R})`;

                const labelTop = '.-' + '~'.repeat(inner - 4) + '-.';
                const left = '/ SIDE A';
                const right = '90 MIN \\';
                const labelMid = left + ' '.repeat(Math.max(1, inner - left.length - right.length)) + right;
                const name = 'H O W A R D';
                const padL = Math.floor((inner - 2 - name.length) / 2);
                const padR = (inner - 2 - name.length) - padL;
                const labelName = '|' + ' '.repeat(Math.max(0, padL)) + name + ' '.repeat(Math.max(0, padR)) + '|';
                const labelBot = '\\__' + '~'.repeat(Math.max(0, inner - '\\__'.length - '__/'.length)) + '__/';
                const windowLine = '-'.repeat(27) + '====' + '-'.repeat(28);
                const state = playing ? 'PLAY' : 'PAUSE';
                const time = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;

                const top = '.' + '-'.repeat(width - 2) + '.';
                const innerBorder = '.' + '-'.repeat(width - 8) + '.';
                const lines = [
                    top,
                    `| ${innerBorder} |`,
                    `| | ${midpad(reelLine)} | |`,
                    `| | ${' '.repeat(inner)} | |`,
                    `| | ${midpad(labelTop)} | |`,
                    `| | ${midpad(labelMid)} | |`,
                    `| | ${midpad(labelName)} | |`,
                    `| | ${midpad(labelBot)} | |`,
                    `| | ${midpad(windowLine)} | |`,
                    `| | ${midpad('| __ __ |')} | |`,
                    `| | ${midpad('| |____| |____| |')} | |`,
                    `| | ${midpad(`${state} >> [${bar}]`)} | |`,
                    `| | ${midpad(`TIME >> ${time}`)} | |`,
                    `| '${'-'.repeat(width - 8)}' |`,
                    `'${'-'.repeat(width - 2)}'`
                ];
                return lines.join('\n');
            };

            const toggle = () => {
                if (audio.paused || audio.ended) {
                    audio.play().catch(() => {});
                } else {
                    audio.pause();
                }
            };

            el.addEventListener('click', toggle);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });

            let t = 0;
            const redraw = () => { el.textContent = makeFrame(t); };
            redraw();

            audio.addEventListener('play', redraw);
            audio.addEventListener('pause', redraw);
            audio.addEventListener('timeupdate', redraw);
            audio.addEventListener('loadedmetadata', redraw);
            audio.addEventListener('ended', redraw);

            setInterval(() => {
                if (!audio.paused && !audio.ended) t += 1;
                redraw();
            }, speedMs);
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
