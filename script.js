// =======================
// HACKCELR8 - script.js
// Fixes first-click nav scroll; stable parallax; UI polish
// =======================

// ---- DOM refs ----
const hamburger = document.querySelector('.hamburger');
const navMenu   = document.querySelector('.nav-menu');
const navbar    = document.querySelector('.navbar');

// ---- Helpers ----
const getNavH = () => (navbar ? navbar.getBoundingClientRect().height : 0);

/**
 * Scroll to a section, accounting for fixed navbar height.
 * @param {HTMLElement} target
 * @param {"auto"|"smooth"} behavior
 */
function scrollToTarget(target, behavior = 'smooth') {
  if (!target) return;
  const navH = getNavH();
  const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 8; // small padding
  window.scrollTo({ top: y, behavior });
}

/**
 * Set scroll-margin-top on section ids so native hash jumps are correct.
 */
function setSectionScrollMargins() {
  const navH = getNavH();
  document.querySelectorAll('section[id]').forEach(sec => {
    sec.style.scrollMarginTop = `${navH + 8}px`;
  });
}

// ---- Mobile Navigation Toggle ----
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when a nav link is tapped
  navMenu.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// ---- Smooth scrolling for ALL in-page anchors (first click works) ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return; // ignore bare '#'
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // Ensure mobile menu is closed BEFORE computing offsets
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');

    // Wait a frame so layout/height settles, then scroll
    requestAnimationFrame(() => scrollToTarget(target, 'smooth'));
  });
});

// ---- Navbar background change on scroll ----
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.style.background = (window.scrollY > 100)
    ? 'rgba(0, 0, 0, 0.95)'
    : 'rgba(0, 0, 0, 0.9)';
}, { passive: true });

// ---- Contact form (mailto) ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name    = this.querySelector('input[name="name"]')?.value?.trim();
    const email   = this.querySelector('input[name="email"]')?.value?.trim();
    const message = this.querySelector('textarea[name="message"]')?.value?.trim();

    if (!name || !email || !message) {
      alert('Please fill in all required fields');
      return;
    }

    const subject = 'HACKCELR8 Contact Form - Message from ' + name;
    const body    = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:studentchapterieee@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    alert('Opening your email client. Please send the email to complete your message.');
    this.reset();
  });
}

// ---- Appear-on-scroll animations ----
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// ---- Initial setup on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Fade scaffold
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  // Set section scroll margins based on current navbar height
  setSectionScrollMargins();

  // Watch for resize (e.g., mobile menu wraps; fonts load) to keep margins true
  window.addEventListener('resize', () => setSectionScrollMargins());

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    '.track-card, .feature, .sponsor-placeholder, .judge-placeholder'
  );
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Card hover lift
  const trackCards = document.querySelectorAll('.track-card');
  trackCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Parallax (background only, no layout shift)
  const parallaxSections = document.querySelectorAll(
    '.hero, .about, .tracks, .sponsors, .judges, .register-contact'
  );

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    parallaxSections.forEach(section => {
      // Clear any previous inline transforms and move only the background
      section.style.transform = '';
      section.style.backgroundPositionY = `${-scrolled * 0.2}px`;

      // Gentle, capped zoom to avoid pixelation
      const zoom = 1 + Math.min(scrolled * 0.0005, 0.15);
      section.style.backgroundSize = `${zoom * 100}%`;
    });
  }, { passive: true });
});

// ---- Fade-in after full load ----
window.addEventListener('load', () => {
  document.body.style.opacity = '1';

  // If page loads with a hash, jump to the section correctly (no animation)
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      // Wait a frame for fonts/layout, then jump with offset
      requestAnimationFrame(() => scrollToTarget(target, 'auto'));
    }
  }
});
