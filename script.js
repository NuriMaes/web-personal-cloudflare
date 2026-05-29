/* ============================================================
   NURIA MAESTRE — PORTFOLIO PERSONAL
   script.js — Interactivity & Animations
   ============================================================ */

'use strict';

// ── Dynamic footer year ─────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Navbar scroll effect ────────────────────────────────────
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run once on load

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  // Prevent body scroll when menu open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    navToggle.focus();
  }
});

// ── Active nav link on scroll ────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

sections.forEach(section => sectionObserver.observe(section));

// ── Scroll-reveal: IntersectionObserver fallback ─────────────
// Checks if native scroll-driven animations are NOT supported,
// then activates the JS-based reveal for .reveal-section elements
// (following the modern-web-guidance best practice).

const supportsScrollDrivenAnimations =
  CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

const revealEls = document.querySelectorAll('.reveal-section');

if (!supportsScrollDrivenAnimations) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger children within the same parent (optional polish)
          const siblings = [...entry.target.parentElement.children].filter(
            el => el.classList.contains('reveal-section')
          );
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 60}ms`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  // Native CSS handles it — just make sure elements are visible for JS-fallback styles
  revealEls.forEach(el => el.classList.add('visible'));
}

// ── Smooth scroll for anchor links ──────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    const navHeight = navbar.getBoundingClientRect().height;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  });
});



// ── Parallax orbs on mouse move ──────────────────────────────
const hero    = document.querySelector('.hero');
const orbs    = document.querySelectorAll('.hero-orb');

if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let rafId = null;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  hero.addEventListener('mousemove', e => {
    const rect   = hero.getBoundingClientRect();
    // Normalize to -1 … +1
    mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });

  function updateOrbs() {
    // Smooth lerp
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 8;
      orb.style.transform = `translate(${targetX * depth}px, ${targetY * depth}px)`;
    });

    rafId = requestAnimationFrame(updateOrbs);
  }

  updateOrbs();

  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });
}

// ── Stat counter animation ────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  let start     = null;
  const startVal = 0;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statCards = document.querySelectorAll('.stat-card');

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl  = entry.target.querySelector('.stat-number');
        const raw    = numEl.dataset.count;
        const plus   = entry.target.querySelector('.stat-plus');
        const plusTxt = plus ? plus.textContent : '';

        if (raw) {
          plus && (plus.textContent = '');
          animateCounter(numEl, parseInt(raw, 10));
          // Re-add "+" after animation
          if (plus) {
            setTimeout(() => (plus.textContent = plusTxt), 1250);
          }
        }

        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

// Assign data-count attributes from text content
statCards.forEach(card => {
  const numEl  = card.querySelector('.stat-number');
  const plusEl = card.querySelector('.stat-plus');
  if (!numEl) return;

  // Extract numeric value
  const rawText = numEl.textContent.replace(plusEl ? plusEl.textContent : '', '').trim();
  const numVal  = parseInt(rawText, 10);
  if (!isNaN(numVal)) {
    numEl.dataset.count = numVal;
  }

  counterObserver.observe(card);
});

// ── Service cards — tilt micro-interaction ───────────────────
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.service-card, .contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        translateY(-5px)
        rotateX(${y * -6}deg)
        rotateY(${x * 6}deg)
      `;
      card.style.transformOrigin = 'center center';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Console greeting ─────────────────────────────────────────
console.log(
  '%c👋 Hola! Soy Nuria Maestre\n%cPython Developer · AI Automation · FinTech\n%cgithub.com/NuriMaes',
  'font-size:18px; font-weight:bold; color:#a78bfa;',
  'font-size:13px; color:#94a3b8;',
  'font-size:11px; color:#60a5fa; text-decoration:underline;'
);
