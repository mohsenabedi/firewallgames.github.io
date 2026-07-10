// script.js — DEAD FREQUENCY interaction layer (Firewall Games)
// No dependencies. Handles: boot sequence, nav, smooth scroll,
// scroll reveals, glitch bursts, ticker loop, custom cursor,
// footer year, Formspree newsletter AJAX.

(() => {
  const docEl = document.documentElement;
  docEl.classList.remove('no-js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- boot sequence (signal lock) ----
  const finishBoot = () => docEl.classList.add('booted');
  if (prefersReducedMotion) {
    finishBoot();
  } else {
    // lock the signal quickly; never block content for long
    window.setTimeout(finishBoot, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('.site-nav');
    const navToggle = document.querySelector('.nav-toggle');

    // ---- header scrolled state ----
    const onScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- mobile nav ----
    const closeNav = () => {
      if (!nav || !navToggle) return;
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        nav.classList.toggle('open', !expanded);
        navToggle.setAttribute('aria-expanded', String(!expanded));
      });
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
      });
    }

    // ---- smooth scroll with header offset ----
    const smoothScroll = (target) => {
      const headerHeight = header ? header.offsetHeight + 10 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };
    document.querySelectorAll('[data-scroll]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const destination = document.querySelector(href);
        if (!destination) return;
        event.preventDefault();
        closeNav();
        smoothScroll(destination);
      });
    });

    // ---- scroll reveals (staggered within shared parents) ----
    const revealItems = document.querySelectorAll('[data-reveal]');
    if (revealItems.length) {
      // stagger siblings so grids cascade in
      const groups = new Map();
      revealItems.forEach((item) => {
        const parent = item.parentElement;
        const index = groups.get(parent) || 0;
        item.style.setProperty('--reveal-delay', `${Math.min(index * 0.08, 0.4)}s`);
        groups.set(parent, index + 1);
      });

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealItems.forEach((item) => observer.observe(item));
    }

    // ---- glitch bursts on display type ----
    const glitchTargets = document.querySelectorAll('.glitch');
    if (glitchTargets.length && !prefersReducedMotion) {
      const burst = () => {
        const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
        target.classList.add('is-glitching');
        window.setTimeout(() => target.classList.remove('is-glitching'), 400);
        window.setTimeout(burst, 1800 + Math.random() * 3200);
      };
      window.setTimeout(burst, 1600);
    }

    // ---- ticker: duplicate content for a seamless loop ----
    document.querySelectorAll('.ticker-track').forEach((track) => {
      track.innerHTML += track.innerHTML;
    });

    // ---- custom cursor ring (fine pointers only) ----
    if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
      const ring = document.createElement('div');
      ring.className = 'cursor-ring';
      ring.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ring);

      let rafId = null;
      let cx = -100;
      let cy = -100;
      const render = () => {
        ring.style.transform = `translate(${cx}px, ${cy}px)`;
        rafId = null;
      };
      window.addEventListener('pointermove', (event) => {
        cx = event.clientX;
        cy = event.clientY;
        document.body.classList.add('cursor-on');
        if (rafId === null) rafId = requestAnimationFrame(render);
      }, { passive: true });
      document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));

      const interactive = 'a, button, summary, input, label, iframe';
      document.addEventListener('pointerover', (event) => {
        ring.classList.toggle('is-active', Boolean(event.target.closest(interactive)));
      });
    }

    // ---- footer year ----
    const yearTarget = document.getElementById('current-year');
    if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());

    // ---- newsletter forms (Formspree) AJAX ----
    document.querySelectorAll('.newsletter-form').forEach((form) => {
      const statusEl = form.querySelector('.form-status');

      const setStatus = (message, type) => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove('success', 'error');
        if (type) statusEl.classList.add(type);
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        setStatus('Transmitting...', null);

        fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(async (response) => {
          if (response.ok) {
            setStatus('Signal received. Watch your inbox for updates.', 'success');
            form.reset();
            return;
          }
          try {
            const data = await response.json();
            if (data && data.errors && data.errors.length) {
              setStatus(data.errors.map((e) => e.message).join(' '), 'error');
              return;
            }
          } catch (e) {
            // ignore JSON parse errors
          }
          setStatus('Signup failed. Please try again or email support@firewallgames.dev.', 'error');
        }).catch(() => {
          setStatus('Network error. Please check your connection and try again.', 'error');
        });
      });
    });
  });
})();
