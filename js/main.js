/* ============================================
   MTANDA — JavaScript Core
   Main initialization, navigation, animations
   ============================================ */

'use strict';

/* ── Utility Helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const qs = (sel) => document.querySelector(sel);
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);
const debounce = (fn, ms = 100) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ── Theme Manager ── */
const ThemeManager = {
  key: 'mtanda-theme',
  init() {
    const saved = localStorage.getItem(this.key);
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.apply(saved || system);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.key)) this.apply(e.matches ? 'dark' : 'light');
    });
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $$('[data-theme-icon]').forEach(el => {
      el.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.key, next);
    this.apply(next);
  }
};

/* ── Language Manager ── */
const LangManager = {
  current: 'en',
  translations: {
    en: { /* English is default */ },
    sw: {
      'Partner With Us': 'Shiriki Nasi',
      'Explore Services': 'Chunguza Huduma',
      'About': 'Kuhusu',
      'Services': 'Huduma',
      'Industries': 'Sekta',
      'Contact': 'Wasiliana',
      'Get in Touch': 'Wasiliana Nasi',
    }
  },
  init() {
    const saved = localStorage.getItem('mtanda-lang') || 'en';
    this.apply(saved);
  },
  apply(lang) {
    this.current = lang;
    localStorage.setItem('mtanda-lang', lang);
    $$('[data-lang-btn]').forEach(el => el.textContent = lang.toUpperCase());
    if (lang === 'sw') {
      Object.entries(this.translations.sw).forEach(([en, sw]) => {
        $$('[data-translate]').forEach(el => {
          if (el.dataset.en === en) el.textContent = sw;
        });
      });
    }
  },
  toggle() {
    this.apply(this.current === 'en' ? 'sw' : 'en');
  }
};

/* ── Loading Screen ── */
const LoadingScreen = {
  el: null,
  init() {
    this.el = qs('#loading-screen');
    if (!this.el) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.el.classList.add('hidden');
        document.body.style.overflow = '';
      }, 1800);
    });
    document.body.style.overflow = 'hidden';
  }
};

/* ── Navigation ── */
const Navigation = {
  nav: null,
  mobileMenu: null,
  menuBtn: null,
  scrollProgress: null,
  lastScroll: 0,
  isMenuOpen: false,

  init() {
    this.nav = qs('#navbar');
    this.mobileMenu = qs('#mobile-menu');
    this.menuBtn = qs('#mobile-menu-btn');
    this.scrollProgress = qs('#scroll-progress');
    if (!this.nav) return;

    on(window, 'scroll', this.onScroll.bind(this), { passive: true });
    on(this.menuBtn, 'click', this.toggleMenu.bind(this));

    // Close menu on link click
    $$('.mobile-nav-link').forEach(link => {
      on(link, 'click', () => this.closeMenu());
    });

    // Close on outside click
    on(document, 'click', e => {
      if (this.isMenuOpen && !this.mobileMenu.contains(e.target) && !this.menuBtn.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Active link highlighting
    this.highlightActiveLink();
    on(window, 'scroll', debounce(this.highlightActiveLink.bind(this), 100), { passive: true });
  },

  onScroll() {
    const scrollY = window.scrollY;

    // Navbar scroll state
    if (scrollY > 50) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }

    // Scroll progress bar
    if (this.scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      this.scrollProgress.style.width = pct + '%';
    }

    // Back to top
    const btt = qs('#back-to-top');
    if (btt) {
      if (scrollY > 500) btt.classList.add('visible');
      else btt.classList.remove('visible');
    }

    this.lastScroll = scrollY;
  },

  toggleMenu() {
    this.isMenuOpen ? this.closeMenu() : this.openMenu();
  },
  openMenu() {
    this.isMenuOpen = true;
    this.mobileMenu?.classList.add('open');
    this.menuBtn?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  closeMenu() {
    this.isMenuOpen = false;
    this.mobileMenu?.classList.remove('open');
    this.menuBtn?.classList.remove('active');
    document.body.style.overflow = '';
  },

  highlightActiveLink() {
    const sections = $$('section[id]');
    const scrollY = window.scrollY + 100;
    let currentId = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop) currentId = s.id;
    });
    $$('.nav-link[data-section]').forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }
};

/* ── Search Overlay ── */
const SearchOverlay = {
  overlay: null,
  input: null,
  init() {
    this.overlay = qs('#search-overlay');
    this.input = qs('#search-input');
    if (!this.overlay) return;
    on(qs('#search-close'), 'click', () => this.close());
    on(this.overlay, 'click', e => { if (e.target === this.overlay) this.close(); });
    on(document, 'keydown', e => {
      if (e.key === 'Escape') this.close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); this.open(); }
    });
  },
  open() {
    this.overlay.classList.add('open');
    setTimeout(() => this.input?.focus(), 100);
  },
  close() { this.overlay.classList.remove('open'); }
};

/* ── AOS (Animate on Scroll) ── */
const AOSManager = {
  observer: null,
  init() {
    const elements = $$('[data-aos]');
    if (!elements.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.aosDelay || 0);
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, delay);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => this.observer.observe(el));
  }
};

/* ── Counter Animation ── */
const CounterManager = {
  observer: null,
  init() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => this.observer.observe(c));
  },

  animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = parseInt(el.dataset.duration || 2000);
    const isDecimal = String(target).includes('.');
    const decimals = isDecimal ? String(target).split('.')[1].length : 0;

    let start = null;
    const startVal = 0;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = this.easeOutExpo(progress);
      const current = startVal + (target - startVal) * eased;
      el.textContent = prefix + (decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
    };
    requestAnimationFrame(step);
  },

  easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }
};

/* ── Parallax ── */
const ParallaxManager = {
  elements: [],
  init() {
    this.elements = $$('[data-parallax]').map(el => ({
      el,
      speed: parseFloat(el.dataset.parallax || 0.3)
    }));
    if (!this.elements.length) return;
    on(window, 'scroll', this.onScroll.bind(this), { passive: true });
  },
  onScroll() {
    const scrollY = window.scrollY;
    this.elements.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }
};

/* ── Tilt Effect ── */
const TiltEffect = {
  init() {
    $$('.tilt-card').forEach(card => {
      on(card, 'mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      });
      on(card, 'mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
};

/* ── Testimonials Slider ── */
const TestimonialsSlider = {
  track: null,
  dots: null,
  currentIndex: 0,
  totalSlides: 0,
  autoplayTimer: null,
  slidesPerView: 2,

  init() {
    this.track = qs('#testimonials-track');
    if (!this.track) return;
    this.totalSlides = this.track.children.length;
    this.updateSlidesPerView();
    this.createDots();
    this.goTo(0);

    on(qs('#slider-prev'), 'click', () => this.prev());
    on(qs('#slider-next'), 'click', () => this.next());

    this.startAutoplay();

    on(this.track, 'mouseenter', () => this.stopAutoplay());
    on(this.track, 'mouseleave', () => this.startAutoplay());

    on(window, 'resize', debounce(() => {
      this.updateSlidesPerView();
      this.goTo(this.currentIndex);
    }, 200));

    // Touch/swipe support
    let startX = 0;
    on(this.track, 'touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    on(this.track, 'touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });
  },

  updateSlidesPerView() {
    this.slidesPerView = window.innerWidth < 768 ? 1 : 2;
    const slides = this.track?.children;
    if (!slides) return;
    [...slides].forEach(slide => {
      slide.style.width = `calc(${100 / this.slidesPerView}% - ${(this.slidesPerView - 1) * 24 / this.slidesPerView}px)`;
    });
  },

  createDots() {
    const container = qs('#slider-dots');
    if (!container) return;
    const numDots = Math.ceil(this.totalSlides / this.slidesPerView);
    container.innerHTML = '';
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      on(dot, 'click', () => this.goTo(i * this.slidesPerView));
      container.appendChild(dot);
    }
    this.dots = $$('.slider-dot', container);
  },

  goTo(index) {
    const max = this.totalSlides - this.slidesPerView;
    this.currentIndex = clamp(index, 0, max);

    const slideWidth = this.track.children[0]?.offsetWidth || 0;
    const gap = 24;
    const offset = this.currentIndex * (slideWidth + gap);
    this.track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    const dotIndex = Math.floor(this.currentIndex / this.slidesPerView);
    this.dots?.forEach((d, i) => d.classList.toggle('active', i === dotIndex));
  },

  next() {
    const nextIndex = this.currentIndex + this.slidesPerView >= this.totalSlides
      ? 0 : this.currentIndex + this.slidesPerView;
    this.goTo(nextIndex);
  },

  prev() {
    const max = this.totalSlides - this.slidesPerView;
    const prevIndex = this.currentIndex === 0
      ? max : this.currentIndex - this.slidesPerView;
    this.goTo(prevIndex);
  },

  startAutoplay() {
    this.autoplayTimer = setInterval(() => this.next(), 5000);
  },
  stopAutoplay() {
    clearInterval(this.autoplayTimer);
  }
};

/* ── Service Modals ── */
const ServiceModals = {
  overlay: null,
  box: null,
  services: {
    'trade-distribution': {
      icon: '🚚',
      title: 'Trade Distribution',
      subtitle: 'Nationwide product delivery with precision and speed',
      description: 'MTANDA\'s Trade Distribution arm provides comprehensive, end-to-end distribution services across Uganda and the East African region. We leverage a robust network of vehicles, warehouses, and field teams to ensure your products reach every market segment efficiently.',
      features: [
        'Nationwide coverage across all 135+ districts',
        'Fleet of refrigerated and standard delivery vehicles',
        'Real-time GPS tracking and route optimization',
        'Same-day delivery for priority shipments',
        'Cold chain management for perishables',
        'Transparent reporting and analytics dashboard'
      ],
      stats: [{ label: 'Districts Covered', value: '135+' }, { label: 'Daily Deliveries', value: '5,000+' }, { label: 'Delivery Accuracy', value: '99.2%' }],
      color: '#2563EB'
    },
    'market-development': {
      icon: '📈',
      title: 'Market Development',
      subtitle: 'Strategic market expansion and brand building',
      description: 'We identify, develop, and grow new markets for our partners. From consumer research to brand positioning, retail activation to channel development, MTANDA\'s market development team drives measurable growth.',
      features: [
        'Market research and consumer insight studies',
        'Channel strategy development',
        'Retail network expansion programs',
        'Brand positioning and messaging',
        'Trade marketing execution',
        'Competitor analysis and gap mapping'
      ],
      stats: [{ label: 'Markets Developed', value: '45+' }, { label: 'Brands Launched', value: '120+' }, { label: 'Market Growth Avg', value: '38%' }],
      color: '#059669'
    },
    'sales-execution': {
      icon: '🎯',
      title: 'Sales Execution',
      subtitle: 'Professional field sales teams driving revenue',
      description: 'Our dedicated sales force executes at the retail level, ensuring product visibility, availability, and offtake. With trained representatives across all territories, we convert distribution presence into actual sales.',
      features: [
        'Dedicated field sales representatives',
        'Territory-based sales management',
        'Digital sales tracking and reporting',
        'Retail relationship management',
        'Promotional execution and compliance',
        'Sales target setting and performance monitoring'
      ],
      stats: [{ label: 'Sales Reps', value: '500+' }, { label: 'Retail Calls/Day', value: '15,000+' }, { label: 'Sales Growth', value: '42%' }],
      color: '#F97316'
    },
    'logistics': {
      icon: '⚡',
      title: 'Logistics & Fulfillment',
      subtitle: 'End-to-end supply chain logistics solutions',
      description: 'MTANDA provides comprehensive logistics solutions from manufacturer to consumer. Our technology-driven approach ensures efficiency, transparency, and reliability at every stage of the supply chain.',
      features: [
        'First-mile and last-mile logistics',
        'Cross-docking and transshipment services',
        'Customs clearance and freight forwarding',
        'Return logistics management',
        'Inventory management and replenishment',
        'SLA-backed delivery commitments'
      ],
      stats: [{ label: 'Vehicles in Fleet', value: '200+' }, { label: 'Tons Moved Monthly', value: '50,000+' }, { label: 'On-Time Rate', value: '97%' }],
      color: '#7C3AED'
    },
    'retail-activation': {
      icon: '🏪',
      title: 'Retail Activation',
      subtitle: 'In-store excellence and consumer engagement',
      description: 'We transform retail spaces into powerful brand experiences. From shelf management and planograms to in-store promotions and consumer activations, MTANDA drives product offtake at the point of purchase.',
      features: [
        'Shop-in-shop setup and management',
        'Planogram design and compliance',
        'Promotional stands and display units',
        'Consumer sampling and demonstration programs',
        'Shopper marketing campaigns',
        'Retail audit and compliance monitoring'
      ],
      stats: [{ label: 'Outlets Activated', value: '50,000+' }, { label: 'Activations/Month', value: '300+' }, { label: 'Conversion Uplift', value: '65%' }],
      color: '#DB2777'
    },
    'warehousing': {
      icon: '🏭',
      title: 'Warehousing & Storage',
      subtitle: 'State-of-the-art storage and inventory management',
      description: 'Our modern warehouse facilities across Uganda provide secure, climate-controlled storage with advanced inventory management systems. We handle your products with the care and precision they deserve.',
      features: [
        'Temperature-controlled storage facilities',
        'Bulk and retail-ready packaging services',
        'Advanced WMS (Warehouse Management System)',
        'FIFO/FEFO inventory control',
        '24/7 security and surveillance',
        'Pest control and quality assurance'
      ],
      stats: [{ label: 'Warehouse Space', value: '100,000 sq ft' }, { label: 'SKUs Managed', value: '10,000+' }, { label: 'Inventory Accuracy', value: '99.8%' }],
      color: '#D97706'
    },
    'supply-chain': {
      icon: '🔗',
      title: 'Supply Chain Management',
      subtitle: 'Integrated supply chain intelligence and optimization',
      description: 'MTANDA provides end-to-end supply chain visibility and management. From demand forecasting to supplier coordination, we ensure seamless product flow from source to shelf.',
      features: [
        'Demand planning and forecasting',
        'Supplier coordination and management',
        'Purchase order management',
        'Supply chain analytics and reporting',
        'Risk management and contingency planning',
        'Sustainability and ESG compliance'
      ],
      stats: [{ label: 'Supply Chain Partners', value: '200+' }, { label: 'Order Fulfillment', value: '99%' }, { label: 'Cost Reduction', value: '25%' }],
      color: '#2563EB'
    },
    'territory-mapping': {
      icon: '🗺️',
      title: 'Territory Mapping',
      subtitle: 'Data-driven geographic market analysis',
      description: 'Using advanced GIS technology and market intelligence, MTANDA maps, analyzes, and optimizes sales territories for maximum coverage and efficiency.',
      features: [
        'GIS-based territory visualization',
        'Market potential assessment by geography',
        'Competitor coverage analysis',
        'Route-to-market optimization',
        'Distribution gap identification',
        'Territory rebalancing and design'
      ],
      stats: [{ label: 'Territories Mapped', value: '500+' }, { label: 'Districts Analyzed', value: '135' }, { label: 'Efficiency Gains', value: '35%' }],
      color: '#059669'
    },
    'order-fulfillment': {
      icon: '📦',
      title: 'Order Fulfillment',
      subtitle: 'Fast, accurate order processing at scale',
      description: 'Our order fulfillment center processes thousands of orders daily with industry-leading accuracy. From order receipt to delivery confirmation, every step is tracked and optimized.',
      features: [
        'Automated order processing system',
        'Same-day order confirmation',
        'Pick, pack, and ship services',
        'Order tracking and status updates',
        'Returns processing and credit management',
        'EDI and API integration with partners'
      ],
      stats: [{ label: 'Orders/Day', value: '10,000+' }, { label: 'Order Accuracy', value: '99.5%' }, { label: 'Processing Time', value: '<2 hrs' }],
      color: '#F97316'
    },
    'field-marketing': {
      icon: '📣',
      title: 'Field Marketing',
      subtitle: 'On-ground brand activation and consumer engagement',
      description: 'Our field marketing teams execute impactful brand experiences across Uganda. From rural market activations to urban consumer events, we connect your brand with its target audience.',
      features: [
        'Roadshows and mobile activations',
        'Rural marketing programs',
        'Digital field force management',
        'Consumer promotion execution',
        'Influencer and community engagement',
        'Event management and logistics'
      ],
      stats: [{ label: 'Activations/Year', value: '1,000+' }, { label: 'Consumers Reached', value: '5M+' }, { label: 'Brand Recall Uplift', value: '55%' }],
      color: '#7C3AED'
    }
  },

  init() {
    this.overlay = qs('#modal-overlay');
    this.box = qs('#modal-box');
    if (!this.overlay) return;

    $$('[data-service-modal]').forEach(card => {
      on(card, 'click', () => this.open(card.dataset.serviceModal));
    });

    on(qs('#modal-close'), 'click', () => this.close());
    on(this.overlay, 'click', e => { if (e.target === this.overlay) this.close(); });
    on(document, 'keydown', e => { if (e.key === 'Escape') this.close(); });
  },

  open(key) {
    const s = this.services[key];
    if (!s || !this.overlay) return;

    const body = qs('#modal-body');
    if (body) {
      body.innerHTML = `
        <div style="margin-bottom: 2rem;">
          <div style="width:72px;height:72px;border-radius:18px;background:${s.color}20;border:2px solid ${s.color}40;display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:1.5rem;">
            ${s.icon}
          </div>
          <p style="font-size:1.125rem;color:var(--text-secondary);line-height:1.7;margin-bottom:1.5rem;">${s.description}</p>
          
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;background:var(--bg-secondary);border-radius:16px;padding:1.5rem;border:1px solid var(--border-color);">
            ${s.stats.map(st => `
              <div style="text-align:center;">
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:${s.color};letter-spacing:-0.02em;">${st.value}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${st.label}</div>
              </div>
            `).join('')}
          </div>

          <h4 style="font-family:var(--font-display);font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem;">Key Capabilities</h4>
          <ul style="display:flex;flex-direction:column;gap:0.75rem;">
            ${s.features.map(f => `
              <li style="display:flex;align-items:flex-start;gap:0.75rem;font-size:0.9375rem;color:var(--text-secondary);line-height:1.5;">
                <span style="color:${s.color};font-size:1.1rem;margin-top:1px;flex-shrink:0;">✓</span>
                ${f}
              </li>
            `).join('')}
          </ul>
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          <a href="#contact" onclick="ServiceModals.close()" class="btn btn-primary">Get a Quote</a>
          <a href="#contact" onclick="ServiceModals.close()" class="btn btn-outline">Learn More</a>
        </div>
      `;
    }

    const title = qs('#modal-title');
    const subtitle = qs('#modal-subtitle');
    if (title) title.textContent = s.title;
    if (subtitle) subtitle.textContent = s.subtitle;

    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ── Hero Particle Canvas ── */
const HeroCanvas = {
  canvas: null,
  ctx: null,
  particles: [],
  connections: [],
  animFrame: null,
  mouse: { x: -9999, y: -9999 },

  init() {
    this.canvas = qs('#hero-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.animate();

    on(window, 'resize', debounce(() => {
      this.resize();
      this.particles = [];
      this.createParticles();
    }, 250));

    on(this.canvas.parentElement, 'mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.6 ? '#3B82F6' : Math.random() > 0.5 ? '#10B981' : '#F97316'
      });
    }
  },

  animate() {
    this.animFrame = requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.x += dx * 0.02;
        p.y += dy * 0.02;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
      this.ctx.fill();
    });

    // Draw connections
    const maxDist = 120;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }
};

/* ── Cookie Consent ── */
const CookieConsent = {
  init() {
    const banner = qs('#cookie-banner');
    if (!banner) return;
    if (localStorage.getItem('mtanda-cookies')) return;
    setTimeout(() => banner.classList.add('visible'), 2000);

    on(qs('#cookie-accept'), 'click', () => {
      localStorage.setItem('mtanda-cookies', 'accepted');
      banner.classList.remove('visible');
    });
    on(qs('#cookie-decline'), 'click', () => {
      localStorage.setItem('mtanda-cookies', 'declined');
      banner.classList.remove('visible');
    });
  }
};

/* ── Back to Top ── */
const BackToTop = {
  init() {
    const btn = qs('#back-to-top');
    if (!btn) return;
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

/* ── Contact Form ── */
const ContactForm = {
  init() {
    const form = qs('#contact-form');
    if (!form) return;
    on(form, 'submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      await new Promise(r => setTimeout(r, 1500));
      btn.textContent = '✓ Message Sent!';
      btn.style.background = 'var(--gradient-emerald)';
      setTimeout(() => {
        form.reset();
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
      }, 3000);
    });
  }
};

/* ── Smooth Scroll (Terminated) ── */
// function initSmoothScroll() {
//   $$('a[href^="#"]').forEach(a => {
//     on(a, 'click', e => {
//       const id = a.getAttribute('href').slice(1);
//       const target = document.getElementById(id);
//       if (target) {
//         e.preventDefault();
//         target.scrollIntoView({ behavior: 'smooth' });
//       }
//     });
//   });
// }

/* ── Text Reveal Animation ── */
function initTextReveal() {
  $$('.text-reveal').forEach(el => {
    const words = el.textContent.split(' ');
    el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
  });
}

/* ── Glassmorphism hover glow ── */
function initGlowEffect() {
  $$('.glow-on-hover').forEach(card => {
    on(card, 'mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--glow-x', x + 'px');
      card.style.setProperty('--glow-y', y + 'px');
    });
  });
}

/* ── Main Init ── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  LangManager.init();
  LoadingScreen.init();
  Navigation.init();
  SearchOverlay.init();
  AOSManager.init();
  CounterManager.init();
  ParallaxManager.init();
  TiltEffect.init();
  TestimonialsSlider.init();
  ServiceModals.init();
  HeroCanvas.init();
  CookieConsent.init();
  BackToTop.init();
  ContactForm.init();
  // initSmoothScroll();
  initTextReveal();
  initGlowEffect();

  // Theme toggle buttons
  $$('[data-theme-toggle]').forEach(btn => {
    on(btn, 'click', () => ThemeManager.toggle());
  });

  // Language toggle
  $$('[data-lang-toggle]').forEach(btn => {
    on(btn, 'click', () => LangManager.toggle());
  });

  // Search toggle
  $$('[data-search-toggle]').forEach(btn => {
    on(btn, 'click', () => SearchOverlay.open());
  });

  console.log('%cMTANDA%c — Building Markets. Moving Products. Growing Brands.', 'color:#2563EB;font-weight:700;font-size:1.25rem', 'color:#6B7280;font-size:0.875rem');
});

// Expose globally for inline handlers
window.ServiceModals = ServiceModals;
window.ThemeManager = ThemeManager;
