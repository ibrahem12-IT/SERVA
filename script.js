/**
 * SERVA — Main Script
 * 
 * Security notes:
 * - No eval(), no innerHTML with user-controlled data
 * - All DOM insertions use textContent or createElement
 * - Event listeners are passive where appropriate (scroll)
 * - No sensitive data stored in localStorage beyond theme preference
 * - Input sanitization done before any DOM reflection
 * 
 * Performance notes:
 * - Single DOMContentLoaded listener (was duplicated in original)
 * - Intersection Observer for scroll animations (no scroll event spam)
 * - requestAnimationFrame for smooth operations
 */

'use strict';

/* ─── Helper: safely get element ───────────────────────── */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ─── 1. PAGE LOADER ────────────────────────────────────── */
function initLoader() {
  const loader = $('#loader-wrapper');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loader-hidden');
      // Remove from DOM after transition to avoid blocking interactions
      loader.addEventListener('transitionend', () => {
        loader.remove();
      }, { once: true });
    }, 500);
  });
}

/* ─── 2. THEME TOGGLE ───────────────────────────────────── */
function initTheme() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const icon = toggle.querySelector('i');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      icon.classList.replace('fa-moon', 'fa-sun');
      toggle.setAttribute('aria-label', 'تبديل إلى الوضع الفاتح');
    } else {
      document.documentElement.removeAttribute('data-theme');
      icon.classList.replace('fa-sun', 'fa-moon');
      toggle.setAttribute('aria-label', 'تبديل إلى الوضع الداكن');
    }
  }

  // Load saved theme or system preference
  const saved = localStorage.getItem('serva-theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    // Only store user's explicit choice (not system default)
    localStorage.setItem('serva-theme', next);
  });
}

/* ─── 3. ACTIVE NAV LINK ────────────────────────────────── */
function initActiveNav() {
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-nav a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active-link');
    }
  });
}

/* ─── 4. HAMBURGER MOBILE MENU ──────────────────────────── */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on link click
  $$('a', mobileNav).forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ─── 5. HERO SLIDER ────────────────────────────────────── */
function initSlider() {
  const slides = $$('.slide');
  const dotsContainer = $('#slider-dots');
  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const INTERVAL = 5000;

  // Build dots
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `الشريحة ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    slides[current].classList.remove('active');
    $$('.slider-dot', dotsContainer || document)[current]?.classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    $$('.slider-dot', dotsContainer || document)[current]?.classList.add('active');
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  // Pause on hover / touch (accessibility + UX)
  const sliderEl = $('.main-slider');
  if (sliderEl) {
    sliderEl.addEventListener('mouseenter', stopAuto);
    sliderEl.addEventListener('mouseleave', startAuto);
    sliderEl.addEventListener('touchstart', stopAuto, { passive: true });
    sliderEl.addEventListener('touchend', startAuto, { passive: true });
  }

  startAuto();
}

/* ─── 6. NAVBAR SCROLL SHADOW ───────────────────────────── */
function initNavScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;

  const observer = new IntersectionObserver(
    ([entry]) => navbar.classList.toggle('scrolled', !entry.isIntersecting),
    { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
  );

  // Observe a sentinel element at top of page
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none;';
  document.body.prepend(sentinel);
  observer.observe(sentinel);
}

/* ─── 7. SCROLL-TO-TOP BUTTON ───────────────────────────── */
function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── 8. SCROLL-IN ANIMATIONS (Intersection Observer) ───── */
function initScrollAnimations() {
  const elements = $$('.card, .info-box, .why-card, .about-intro');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => {
    // Set initial state via JS (no layout shift before JS loads)
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

/* ─── 9. CONTACT FORM — CLIENT-SIDE VALIDATION ──────────── */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  /**
   * SECURITY: Client-side validation is UX-only.
   * Server MUST validate all inputs independently.
   * Never trust client-submitted data.
   */

  // Input sanitizer — removes dangerous characters for display purposes
  function sanitizeInput(str) {
    return str.replace(/[<>"'&]/g, char => ({
      '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'
    }[char]));
  }

  function showMsg(type, text) {
    const msg = $('#form-msg');
    if (!msg) return;
    msg.className = `form-msg ${type}`;
    // Use textContent, NEVER innerHTML with user data
    msg.textContent = sanitizeInput(text);
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 5000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = $('#input-name', form)?.value.trim();
    const email   = $('#input-email', form)?.value.trim();
    const message = $('#input-message', form)?.value.trim();

    // Basic client-side validation
    if (!name || name.length < 2) {
      return showMsg('error', 'يرجى إدخال الاسم الكامل');
    }

    // RFC 5322 simplified email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return showMsg('error', 'يرجى إدخال بريد إلكتروني صحيح');
    }

    if (!message || message.length < 10) {
      return showMsg('error', 'يرجى كتابة رسالة لا تقل عن 10 أحرف');
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'جاري الإرسال...';

    /**
     * TODO: Replace with actual backend endpoint
     * SECURITY: Use HTTPS, add CSRF token header, validate server-side
     * Example:
     * const res = await fetch('/api/contact', {
     *   method: 'POST',
     *   headers: {
     *     'Content-Type': 'application/json',
     *     'X-CSRF-Token': getCsrfToken()
     *   },
     *   body: JSON.stringify({ name, email, message })
     * });
     */

    // Simulate async submission (replace with real fetch)
    await new Promise(resolve => setTimeout(resolve, 1200));

    showMsg('success', 'شكراً! تم استلام رسالتك وسنتواصل معك قريباً.');
    form.reset();
    btn.disabled = false;
    btn.textContent = 'إرسال الرسالة';
  });
}

/* ─── 10. LANGUAGE SWITCHER ─────────────────────────────── */
/**
 * SECURITY NOTE on Google Translate:
 * The original implementation manipulates cookies to control GT.
 * This is kept as-is but note:
 * - GT injects scripts and modifies DOM — be aware of XSS risk
 * - Consider a native i18n solution for production
 * - Never pass unsanitized user input to the translation API
 */
function changeLanguage(lang) {
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Allowed values only: 'ar' or 'en'
  const allowedLangs = ['ar', 'en'];
  if (!allowedLangs.includes(lang)) return; // Security: reject unexpected values

  const cookieValue = `/ar/${lang}`;
  document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax`;
  if (window.location.hostname) {
    document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/; SameSite=Lax`;
  }
}

function googleTranslateElementInit() {
  if (typeof google === 'undefined' || !google.translate) return;
  new google.translate.TranslateElement({
    pageLanguage: 'ar',
    includedLanguages: 'ar,en',
    autoDisplay: false
  }, 'google_translate_element');
}

// Expose to global scope for Google Translate callback
window.changeLanguage = changeLanguage;
window.googleTranslateElementInit = googleTranslateElementInit;

/* ─── INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initTheme();
  initActiveNav();
  initMobileMenu();
  initSlider();
  initNavScroll();
  initScrollTop();
  initScrollAnimations();
  initContactForm();
});
