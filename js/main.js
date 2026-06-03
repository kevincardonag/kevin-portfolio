// =============================================================================
// Main.js — UI interactions, animations, and behavior
// Vanilla JS, no dependencies. Loaded after resume-data.js.
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Element References ──────────────────────────────────────────────────
  const navbar       = document.getElementById('navbar');
  const hamburger    = document.getElementById('hamburger');
  const navLinks     = document.getElementById('nav-links');
  const typingText   = document.getElementById('typing-text');
  const currentYear  = document.getElementById('current-year');

  // ── 2. Footer Year ────────────────────────────────────────────────────────
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // ── 3. Navbar Scroll Effect ────────────────────────────────────────────────
  const SCROLL_THRESHOLD = 50;

  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // initial check

  // ── 4. Active Nav Link Highlighting ────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          allNavLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      rootMargin: '-80px 0px -50% 0px', // account for fixed navbar
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // ── 5. Smooth Scroll for Anchor Links ──────────────────────────────────────
  const NAV_HEIGHT = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── 6. Hamburger Menu ──────────────────────────────────────────────────────
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close on nav-link click
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // ── 7. Scroll Reveal Animations ───────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ── 8. Typing Animation ───────────────────────────────────────────────────
  const TYPING_WORDS = [
    'robust web applications',
    'scalable APIs',
    'AI-powered solutions',
    'full-stack systems',
  ];
  const TYPE_SPEED   = 80;   // ms per character
  const DELETE_SPEED  = 40;  // ms per character
  const PAUSE_AFTER   = 2000; // ms after full word
  const PAUSE_BEFORE  = 500;  // ms before next word

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    if (!typingText) return;

    const currentWord = TYPING_WORDS[wordIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      typingText.textContent = currentWord.substring(0, charIndex);

      if (charIndex === currentWord.length) {
        // Full word typed — pause then start deleting
        isDeleting = true;
        setTimeout(typeLoop, PAUSE_AFTER);
        return;
      }
      setTimeout(typeLoop, TYPE_SPEED);
    } else {
      // Deleting backward
      charIndex--;
      typingText.textContent = currentWord.substring(0, charIndex);

      if (charIndex === 0) {
        // Fully deleted — move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % TYPING_WORDS.length;
        setTimeout(typeLoop, PAUSE_BEFORE);
        return;
      }
      setTimeout(typeLoop, DELETE_SPEED);
    }
  }

  typeLoop();

  // ── 9. Counter Animation ──────────────────────────────────────────────────
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const duration = 2000;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuart(progress) * target);

      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  statNumbers.forEach((el) => counterObserver.observe(el));

  // ── 10. Resume Download ───────────────────────────────────────────────────
  function handleResumeDownload(e) {
    e.preventDefault();

    // Try to download a PDF if available, otherwise use print
    const pdfPath = 'assets/kevin-resume.pdf';

    fetch(pdfPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          const link = document.createElement('a');
          link.href = pdfPath;
          link.download = 'Kevin_Cardona_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.print();
        }
      })
      .catch(() => {
        window.print();
      });
  }

  const downloadBtns = [
    document.getElementById('download-resume'),
    document.getElementById('download-resume-hero'),
  ];

  downloadBtns.forEach((btn) => {
    if (btn) btn.addEventListener('click', handleResumeDownload);
  });

  // ── 11. Background Canvas Animation (Particles) ──────────────────────────
  initParticleCanvas();

  // ── 12. GitHub Config Modal ───────────────────────────────────────────────
  initGitHubConfigModal();

  // ── 13. Initialize GitHub Integration ─────────────────────────────────────
  if (window.GitHubIntegration) {
    window.GitHubIntegration.init();
  }
});

// =============================================================================
// Particle Canvas — subtle floating dots with faint connections
// =============================================================================
function initParticleCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.15;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let animationId;

  const PARTICLE_COUNT = 30;
  const CONNECTION_DISTANCE = 150;
  const PARTICLE_COLOR = '100, 255, 218'; // #64ffda in RGB

  const particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
    };
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    // Update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = 1 - dist / CONNECTION_DISTANCE;
          ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${opacity * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.8)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    if (document.hidden) {
      // Pause when tab is hidden
      animationId = requestAnimationFrame(animate);
      return;
    }
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Visibility change — truly pause/resume
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!document.hidden && !animationId) {
      animationId = requestAnimationFrame(animate);
    }
  });

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  animationId = requestAnimationFrame(animate);
}

// =============================================================================
// GitHub Config Modal — token management
// =============================================================================
function initGitHubConfigModal() {
  const configBtn   = document.getElementById('github-config-btn');
  const modal       = document.getElementById('github-config-modal');
  const closeBtn    = document.getElementById('github-config-close');
  const saveBtn     = document.getElementById('github-token-save');
  const clearBtn    = document.getElementById('github-token-clear');
  const tokenInput  = document.getElementById('github-token-input');

  if (!modal) return;

  function openModal() {
    modal.classList.add('active');
    // Pre-fill if token exists
    if (tokenInput) {
      const existing = localStorage.getItem('github_pat');
      if (existing) {
        tokenInput.value = existing.substring(0, 8) + '••••••••••••';
        tokenInput.dataset.hasToken = 'true';
      } else {
        tokenInput.value = '';
        tokenInput.dataset.hasToken = 'false';
      }
    }
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  if (configBtn) configBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!tokenInput) return;

      const token = tokenInput.value.trim();
      // Don't save the masked version
      if (token && !token.includes('••••')) {
        localStorage.setItem('github_pat', token);
      }

      closeModal();

      // Reload GitHub data with new token
      if (window.GitHubIntegration) {
        // Clear cache so we re-fetch with token
        localStorage.removeItem(window.GitHubIntegration.cacheKey);
        window.GitHubIntegration.init();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('github_pat');
      if (tokenInput) tokenInput.value = '';
      closeModal();

      // Reload GitHub data without token
      if (window.GitHubIntegration) {
        localStorage.removeItem(window.GitHubIntegration.cacheKey);
        window.GitHubIntegration.init();
      }
    });
  }

  // Click outside modal content to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
