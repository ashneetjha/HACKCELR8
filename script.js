// =======================
// HACKCELR8 - script.js
// Fixes first-click nav scroll; stable parallax; UI polish
// + Custom F1 Triangular Cursor (desktop only)
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

/**
 * Initialize custom F1 triangular cursor (desktop/laptop only).
 * Requires CSS classes: .cursor-tri and .cursor-trail
 */
function initCustomCursor() {
  // Disable on touch devices or when no fine pointer
  if (window.matchMedia('(any-pointer: coarse)').matches) return;

  // Create cursor elements
  const tri   = document.createElement('div');
  const trail = document.createElement('div');
  tri.className   = 'cursor-tri';
  trail.className = 'cursor-trail';
  document.body.appendChild(trail);
  document.body.appendChild(tri);

  // Measure sizes so the tip aligns with the pointer
  let triW = 22, triH = 16, trailW = 34, trailH = 24;
  const measure = () => {
    const r1 = tri.getBoundingClientRect();
    const r2 = trail.getBoundingClientRect();
    if (r1.width)  triW  = r1.width;
    if (r1.height) triH  = r1.height;
    if (r2.width)  trailW = r2.width;
    if (r2.height) trailH = r2.height;
  };
  measure();
  window.addEventListener('resize', measure);

  // Position state
  let x = window.innerWidth / 2,  y = window.innerHeight / 2; // mouse target
  let xr = x, yr = y; // trail (lerped) coords
  const lerp = (a, b, t) => a + (b - a) * t;

  // Show/hide on enter/leave/focus
  const show = () => {
    tri.style.opacity = '1';
    trail.style.opacity = '0.35';
  };
  const hide = () => {
    tri.style.opacity = '0';
    trail.style.opacity = '0';
  };
  document.addEventListener('mouseenter', show);
  document.addEventListener('mouseleave', hide);
  window.addEventListener('blur',  hide);
  window.addEventListener('focus', show);

  // Update function to place elements.
  // Triangle tip is at left-middle => left = x, top = y - triH/2
  function placeTriangle(cx, cy) {
    tri.style.setProperty('--tx', `${cx}px`);
    tri.style.setProperty('--ty', `${cy - triH / 2}px`);
  }
  // Trail sits slightly behind the tip (shift left a bit)
  function placeTrail(cx, cy) {
    const back = 6; // how far behind the tip
    trail.style.transform = `translate(${cx - back}px, ${cy - trailH / 2}px)`;
  }

  // First position
  placeTriangle(x, y);
  placeTrail(xr, yr);

  // Move handler
  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;

    // place triangle immediately
    placeTriangle(x, y);

    // clickable state (links, buttons, role=button, .btn, input buttons)
    const el = document.elementFromPoint(x, y);
    const clickable = !!(
      el &&
      el.closest('a,button,[role="button"],.btn,input[type="submit"],input[type="button"]')
    );
    document.documentElement.classList.toggle('cursor-clickable', clickable);
  }, { passive: true });

  // Mouse press visual feedback
  window.addEventListener('mousedown', () => {
    document.documentElement.classList.add('cursor-down');
  });
  window.addEventListener('mouseup', () => {
    document.documentElement.classList.remove('cursor-down');
  });

  // Smooth trailing loop
  let raf;
  function tick() {
    xr = lerp(xr, x, 0.18);
    yr = lerp(yr, y, 0.18);
    placeTrail(xr, yr);
    raf = requestAnimationFrame(tick);
  }
  tick();

  // Pause RAF when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
    } else {
      tick();
    }
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

  // Keep margins true on resize/font-load
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

  // Parallax (background only, no layout shift) — disabled for touch or reduced-motion
  const enableParallax =
    !window.matchMedia('(any-pointer: coarse)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (enableParallax) {
    const parallaxSections = document.querySelectorAll(
      '.hero, .about, .tracks, .sponsors, .judges, .register-contact'
    );

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      parallaxSections.forEach(section => {
        section.style.transform = '';
        section.style.backgroundPositionY = `${-scrolled * 0.2}px`;

        const zoom = 1 + Math.min(scrolled * 0.0005, 0.15);
        section.style.backgroundSize = `${zoom * 100}%`;
      });
    }, { passive: true });
  }

  // Init the F1 triangular cursor after DOM is ready
  initCustomCursor();
});

// ---- Fade-in after full load ----
window.addEventListener('load', () => {
  document.body.style.opacity = '1';

  // If page loads with a hash, jump to the section correctly (no animation)
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      requestAnimationFrame(() => scrollToTarget(target, 'auto'));
    }
  }
});
