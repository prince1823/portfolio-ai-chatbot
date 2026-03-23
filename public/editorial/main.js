// ============================================
// onlysif.com — Interactions
// ============================================

// Scroll reveal
const initReveal = () => {
  const elements = document.querySelectorAll(
    '.hero-label, .hero-title, .hero-statement, .hero-aside, ' +
    '.operator-number, .operator-text, ' +
    '.section-header, .capability, ' +
    '.work-header, ' +
    '.other-work > .mono-sm, .other-item, ' +
    '.agency-inner > *, ' +
    '.origin-timeline, .origin-statement, ' +
    '.how-inner > *, ' +
    '.testimonials > .mono-sm, .testimonial, ' +
    '.contact-inner > *, ' +
    '.tool-item'
  );

  elements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
};

// Horizontal scroll with mouse wheel
const initHorizontalScroll = () => {
  const scrollContainer = document.querySelector('.work-scroll');
  if (!scrollContainer) return;

  scrollContainer.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });
};

// Smooth parallax on hero elements
const initParallax = () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const line1 = hero.querySelector('.line-1');
  const line2 = hero.querySelector('.line-2');
  const aside = hero.querySelector('.hero-aside');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY < heroHeight) {
      const progress = scrollY / heroHeight;
      if (line1) line1.style.transform = `translateX(${progress * -40}px)`;
      if (line2) line2.style.transform = `translateX(${progress * 20}px)`;
      if (aside) aside.style.transform = `translateY(${progress * -30}px)`;
    }
  }, { passive: true });
};

// Cursor follower accent dot
const initCursor = () => {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    mix-blend-mode: difference;
    transition: transform 0.15s ease, opacity 0.3s ease;
    opacity: 0;
  `;
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
  });

  const animate = () => {
    dotX += (mouseX - dotX) * 0.12;
    dotY += (mouseY - dotY) * 0.12;
    dot.style.left = dotX - 4 + 'px';
    dot.style.top = dotY - 4 + 'px';
    requestAnimationFrame(animate);
  };
  animate();

  // Scale up on interactive elements
  document.querySelectorAll('a, .capability, .work-card, .other-item, .contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(4)';
      dot.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
      dot.style.opacity = '1';
    });
  });
};

// Nav fade on scroll
const initNavFade = () => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 200 && scrollY > lastScroll) {
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    } else {
      nav.style.opacity = '1';
      nav.style.pointerEvents = 'auto';
    }
    lastScroll = scrollY;
  }, { passive: true });

  nav.style.transition = 'opacity 0.4s ease';
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initHorizontalScroll();
  initParallax();
  initCursor();
  initNavFade();
});
