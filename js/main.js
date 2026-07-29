/**
 * Weathervane Cottages — main.js (V2)
 * Mobile nav, accordion, reveals, forms, lightbox, view transitions
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Year in footer
     ---------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  const body = document.body;

  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    siteNav.classList.remove('is-open');
    body.classList.remove('is-nav-open');
  }

  function openNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    siteNav.classList.add('is-open');
    body.classList.add('is-nav-open');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     Accordion
     ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    accordion.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;

        // Close siblings within this accordion
        accordion.querySelectorAll('.accordion__trigger').forEach(function (other) {
          if (other === trigger) return;
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          const otherPanel = otherId ? document.getElementById(otherId) : null;
          if (otherPanel) otherPanel.hidden = true;
        });

        trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (panel) panel.hidden = expanded;
      });
    });
  });

  /* ----------------------------------------------------------------------
     IntersectionObserver reveals
     ---------------------------------------------------------------------- */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ----------------------------------------------------------------------
     Form validation helpers
     ---------------------------------------------------------------------- */
  function validateField(field) {
    if (!field) return true;
    const valid = field.checkValidity();
    field.classList.toggle('is-invalid', !valid);
    return valid;
  }

  function clearInvalid(form) {
    form.querySelectorAll('.is-invalid').forEach(function (el) {
      el.classList.remove('is-invalid');
    });
  }

  /* Newsletter */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    const emailInput = document.getElementById('newsletter-email');
    const messageEl = document.getElementById('newsletter-message');

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearInvalid(newsletterForm);
      if (!validateField(emailInput)) {
        if (messageEl) {
          messageEl.hidden = false;
          messageEl.className = 'form-message is-error';
          messageEl.textContent = 'Please enter a valid email address.';
        }
        return;
      }
      if (messageEl) {
        messageEl.hidden = false;
        messageEl.className = 'form-message is-success';
        messageEl.textContent = 'Thank you — you’re on the list. We’ll be in touch.';
      }
      newsletterForm.reset();
    });

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        emailInput.classList.remove('is-invalid');
      });
    }
  }

  /* Book form */
  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    const statusEl = document.getElementById('book-message-status');
    const requiredFields = bookForm.querySelectorAll('[required]');

    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearInvalid(bookForm);
      let ok = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) ok = false;
      });

      // Soft date check
      const arrive = bookForm.querySelector('#book-arrive');
      const depart = bookForm.querySelector('#book-depart');
      if (arrive && depart && arrive.value && depart.value) {
        if (new Date(depart.value) <= new Date(arrive.value)) {
          depart.classList.add('is-invalid');
          ok = false;
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.className = 'form-message is-error';
            statusEl.textContent = 'Departure should be after your arrival date.';
          }
          return;
        }
      }

      if (!ok) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.className = 'form-message is-error';
          statusEl.textContent = 'Please fill in the required fields.';
        }
        const firstInvalid = bookForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (statusEl) {
        statusEl.hidden = false;
        statusEl.className = 'form-message is-success';
        statusEl.textContent =
          'Thank you — we’ve received your request and will be in touch shortly. For a faster reply, call (401) 366-8010.';
      }
      bookForm.reset();
    });

    requiredFields.forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('is-invalid');
      });
    });
  }

  /* ----------------------------------------------------------------------
     Lightbox (gallery)
     ---------------------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let currentItems = [];
    let currentIndex = 0;
    let lastFocus = null;

    function getItems(grid) {
      return Array.from(grid.querySelectorAll('.gallery__item')).map(function (btn) {
        const img = btn.querySelector('img');
        return {
          src: img ? img.currentSrc || img.src : '',
          alt: img ? img.alt || '' : '',
        };
      });
    }

    function showImage(index) {
      if (!currentItems.length) return;
      currentIndex = (index + currentItems.length) % currentItems.length;
      const item = currentItems[currentIndex];
      if (lightboxImg) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = item.alt || '';
      }
    }

    function openLightbox(items, index) {
      currentItems = items;
      lastFocus = document.activeElement;
      showImage(index);
      lightbox.hidden = false;
      body.classList.add('is-nav-open'); // reuse scroll lock
      const closeBtn = lightbox.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      body.classList.remove('is-nav-open');
      if (lightboxImg) {
        lightboxImg.src = '';
        lightboxImg.alt = '';
      }
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    document.querySelectorAll('[data-gallery]').forEach(function (grid) {
      grid.querySelectorAll('.gallery__item').forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          openLightbox(getItems(grid), i);
        });
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    const nextBtn = lightbox.querySelector('[data-lightbox-next]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        showImage(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        showImage(currentIndex + 1);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showImage(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        showImage(currentIndex + 1);
      }
    });
  }

  /* ----------------------------------------------------------------------
     View Transitions for internal links
     ---------------------------------------------------------------------- */
  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    // Same-page hash only — let browser handle
    if (url.pathname === window.location.pathname && url.hash) return false;
    // Only html pages / relative site paths
    return true;
  }

  if (!reducedMotion && typeof document.startViewTransition === 'function') {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = e.target.closest('a');
      if (!anchor || !isInternalLink(anchor)) return;

      const href = anchor.href;
      // Skip if identical full URL
      if (href === window.location.href) return;

      e.preventDefault();
      document.startViewTransition(function () {
        window.location.href = href;
      });
    });
  }
})();