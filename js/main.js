/**
 * Weathervane Cottages — main interactions
 * Sticky header, mobile nav, reveals, parallax, forms, lazy images
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------- */
  /* Footer year                                                            */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------------------------------------------------------------------- */
  /* Sticky header                                                          */
  /* ---------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  if (header) {
    let ticking = false;

    const updateHeader = function () {
      const scrolled = window.scrollY > 24;
      header.classList.toggle('is-scrolled', scrolled);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateHeader();
  }

  /* ---------------------------------------------------------------------- */
  /* Mobile navigation                                                      */
  /* ---------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav && header) {
    const setNavOpen = function (open) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      header.classList.toggle('nav-open', open);
      document.body.classList.toggle('nav-locked', open);
    };

    navToggle.addEventListener('click', function () {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      setNavOpen(open);
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNavOpen(false);
    });

    window.addEventListener(
      'resize',
      function () {
        if (window.innerWidth >= 900) setNavOpen(false);
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Smooth scroll for same-page anchors                                    */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------------- */
  /* IntersectionObserver reveals                                           */
  /* ---------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Hero parallax (subtle, 1.05 max equivalent via translate)              */
  /* ---------------------------------------------------------------------- */
  const parallaxHost = document.querySelector('[data-parallax]');
  const parallaxImg = parallaxHost ? parallaxHost.querySelector('img') : null;

  if (parallaxImg && !reduceMotion) {
    let parallaxTick = false;

    const updateParallax = function () {
      const rect = parallaxHost.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      if (rect.bottom > 0 && rect.top < viewH) {
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const y = (progress - 0.5) * 36;
        parallaxImg.style.transform = 'scale(1.04) translate3d(0, ' + y.toFixed(2) + 'px, 0)';
      }
      parallaxTick = false;
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!parallaxTick) {
          window.requestAnimationFrame(updateParallax);
          parallaxTick = true;
        }
      },
      { passive: true }
    );

    updateParallax();
  }

  /* ---------------------------------------------------------------------- */
  /* Lazy image fade-in                                                     */
  /* ---------------------------------------------------------------------- */
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  lazyImages.forEach(function (img) {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener(
        'load',
        function () {
          img.classList.add('is-loaded');
        },
        { once: true }
      );
      img.addEventListener(
        'error',
        function () {
          img.classList.add('is-loaded');
        },
        { once: true }
      );
    }
  });

  /* ---------------------------------------------------------------------- */
  /* Newsletter form (front-end only acknowledgment)                        */
  /* ---------------------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (!input || !input.value) return;
      const btn = newsletterForm.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Subscribed';
        btn.disabled = true;
        input.value = '';
        window.setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 2800);
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Booking form validation                                                */
  /* ---------------------------------------------------------------------- */
  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    const success = document.getElementById('form-success');

    const fields = [
      { id: 'first-name', validate: function (v) { return v.trim().length > 0; } },
      { id: 'last-name', validate: function (v) { return v.trim().length > 0; } },
      {
        id: 'email',
        validate: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        }
      },
      { id: 'check-in', validate: function (v) { return v.trim().length > 0; } },
      { id: 'check-out', validate: function (v) { return v.trim().length > 0; } },
      { id: 'guests', validate: function (v) { return v.trim().length > 0; } }
    ];

    const setFieldState = function (id, valid) {
      const input = document.getElementById(id);
      const error = document.querySelector('[data-error-for="' + id + '"]');
      if (!input) return;
      input.classList.toggle('is-invalid', !valid);
      if (error) error.hidden = valid;
    };

    fields.forEach(function (field) {
      const input = document.getElementById(field.id);
      if (!input) return;
      input.addEventListener('blur', function () {
        setFieldState(field.id, field.validate(input.value));
      });
      input.addEventListener('input', function () {
        if (input.classList.contains('is-invalid')) {
          setFieldState(field.id, field.validate(input.value));
        }
      });
    });

    // Keep check-out after check-in
    const checkIn = document.getElementById('check-in');
    const checkOut = document.getElementById('check-out');
    if (checkIn && checkOut) {
      const today = new Date().toISOString().split('T')[0];
      checkIn.min = today;
      checkOut.min = today;

      checkIn.addEventListener('change', function () {
        if (checkIn.value) {
          checkOut.min = checkIn.value;
          if (checkOut.value && checkOut.value < checkIn.value) {
            checkOut.value = '';
          }
        }
      });
    }

    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let ok = true;

      fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        if (!input) return;
        const valid = field.validate(input.value);
        setFieldState(field.id, valid);
        if (!valid) ok = false;
      });

      // Date order
      if (checkIn && checkOut && checkIn.value && checkOut.value) {
        if (checkOut.value <= checkIn.value) {
          setFieldState('check-out', false);
          ok = false;
        }
      }

      if (!ok) {
        const firstInvalid = bookForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      }

      bookForm.reset();
      fields.forEach(function (field) {
        setFieldState(field.id, true);
      });
    });
  }
})();