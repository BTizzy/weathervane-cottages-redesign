/* Weathervane Cottages — main.js
   Lightweight, no dependencies. Handles:
   - sticky header (background swap on scroll)
   - mobile nav toggle
   - smooth scroll for anchor links
   - reveal-on-scroll via IntersectionObserver
   - lazy image fade-in
   - simple parallax on hero (rAF-throttled)
   - current year in footer
*/
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -- Header scroll state ---------------------------------------------------
  const header = $('#siteHeader');
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 32);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -- Mobile nav toggle -----------------------------------------------------
  const navToggle = $('#navToggle');
  const nav = $('#nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = !header.classList.contains('is-open');
      header.classList.toggle('is-open', open);
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click (mobile)
    $$('.nav__link, .nav__cta', nav).forEach(l => l.addEventListener('click', () => {
      header.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  // -- Smooth scroll for anchor links ---------------------------------------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = (header && header.offsetHeight) || 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // -- Reveal on scroll ------------------------------------------------------
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // -- Lazy image fade-in ----------------------------------------------------
  $$('img[loading="lazy"]').forEach(img => {
    if (img.complete) return;
    img.style.opacity = '0';
    img.style.transition = 'opacity 600ms ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
    img.addEventListener('error', () => { img.style.opacity = '1'; }, { once: true });
  });

  // -- Hero parallax (rAF-throttled) ----------------------------------------
  if (!reduced) {
    const hero = $('#hero');
    const heroImg = hero && hero.querySelector('.hero__media img');
    if (hero && heroImg) {
      let ticking = false;
      const update = () => {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, -rect.top / rect.height));
        heroImg.style.transform = `scale(1.06) translateY(${progress * 24}px)`;
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }
  }

  // -- Footer year -----------------------------------------------------------
  const yEl = $('[data-year]');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
