/* ============================================
   MTANDA — Pages JavaScript
   Tabs, Accordions, and page-specific logic
   ============================================ */

'use strict';

/* ── Tab System ── */
function initTabs() {
  document.querySelectorAll('.tabs-nav').forEach(nav => {
    const container = nav.closest('.tabs-wrapper') || nav.parentElement;
    const panels = container.querySelectorAll('.tab-panel');
    const btns = nav.querySelectorAll('.tab-btn');

    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i]?.classList.add('active');
      });
    });
    // Activate first by default
    btns[0]?.classList.add('active');
    panels[0]?.classList.add('active');
  });
}

/* ── Accordion System ── */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      // Open clicked if wasn't open
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ── Filter Chips ── */
function initFilterChips() {
  document.querySelectorAll('.filter-chips').forEach(container => {
    const chips = container.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        const grid = container.nextElementSibling;
        if (!grid) return;
        grid.querySelectorAll('[data-category]').forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    chips[0]?.classList.add('active');
  });
}

/* ── Active nav page highlight ── */
function highlightCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page], .mobile-nav-link[data-page]').forEach(link => {
    if (link.dataset.page === path) {
      link.classList.add('page-active');
    }
  });
}

/* ── Careers form ── */
function initCareersPageForm() {
  const form = document.getElementById('full-careers-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1800));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Application Submitted!';
    btn.style.background = 'var(--gradient-emerald)';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.background = '';
    }, 4000);
  });
}

/* ── Contact page form ── */
function initContactPageForm() {
  const form = document.getElementById('contact-page-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1500));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
    btn.style.background = 'var(--gradient-emerald)';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.background = '';
    }, 3500);
  });
}

/* ── Partner application form ── */
function initPartnerForm() {
  const form = document.getElementById('partner-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1800));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Application Received!';
    btn.style.background = 'var(--gradient-emerald)';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.background = '';
    }, 4000);
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAccordions();
  initFilterChips();
  highlightCurrentPage();
  initCareersPageForm();
  initContactPageForm();
  initPartnerForm();
});
