// ================================================
//  TrendScope — Main JavaScript
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ── Mobile hamburger menu ──
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // ── Animated number counters ──
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const animateCounters = () => {
    statNumbers.forEach(el => {
      const target = parseFloat(el.dataset.target);
      const duration = 2000;
      const start = performance.now();
      const isDecimal = target % 1 !== 0;
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  // ── Intersection Observer for animations ──
  const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        // Trigger counter animation when hero stats come into view
        if (entry.target.closest('.hero') || entry.target.closest('.hero-stats')) {
          animateCounters();
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe AOS elements
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  // Also observe hero stats section
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  // ── Dashboard chart ──
  const canvas = document.getElementById('chartCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationProgress = 0;
    let currentData = generateTrendData('ai');

    const trendDatasets = {
      ai: { label: 'Artificial Intelligence', color: '#6366f1', data: generateTrendData('ai') },
      green: { label: 'Green Technology', color: '#10b981', data: generateTrendData('green') },
      remote: { label: 'Remote Work', color: '#06b6d4', data: generateTrendData('remote') },
      crypto: { label: 'Cryptocurrency', color: '#f59e0b', data: generateTrendData('crypto') }
    };

    function generateTrendData(type) {
      const points = [];
      const patterns = {
        ai: [20, 25, 28, 35, 40, 38, 45, 52, 58, 65, 72, 78, 85, 90, 88, 92, 95, 98, 96, 100, 105, 110, 115, 120],
        green: [30, 32, 35, 38, 42, 48, 52, 50, 55, 60, 65, 62, 68, 72, 75, 78, 82, 85, 88, 90, 92, 95, 98, 100],
        remote: [80, 85, 90, 88, 82, 78, 75, 70, 68, 65, 62, 60, 58, 55, 52, 50, 48, 47, 46, 45, 44, 43, 42, 42],
        crypto: [50, 55, 48, 62, 45, 70, 55, 80, 65, 45, 75, 60, 85, 55, 70, 90, 65, 80, 75, 95, 70, 85, 80, 92]
      };
      return patterns[type] || patterns.ai;
    }

    function drawChart(data, color, progress) {
      const w = canvas.width;
      const h = canvas.height;
      const padding = 40;
      const chartW = w - padding * 2;
      const chartH = h - padding * 2;

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
      }

      // Draw axes labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter, sans-serif';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        const x = padding + (chartW / 11) * i;
        ctx.fillText(months[i], x - 10, h - 10);
      }

      const maxVal = Math.max(...data);
      const minVal = Math.min(...data);
      const range = maxVal - minVal || 1;

      const pointsToDraw = Math.floor(data.length * progress);
      if (pointsToDraw < 2) return;

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, h - padding);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');

      // Area
      ctx.beginPath();
      ctx.moveTo(padding, h - padding);
      for (let i = 0; i < pointsToDraw; i++) {
        const x = padding + (chartW / (data.length - 1)) * i;
        const y = padding + chartH - ((data[i] - minVal) / range) * chartH;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = padding + (chartW / (data.length - 1)) * (i - 1);
          const prevY = padding + chartH - ((data[i - 1] - minVal) / range) * chartH;
          const cpx = (prevX + x) / 2;
          ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
        }
      }
      const lastX = padding + (chartW / (data.length - 1)) * (pointsToDraw - 1);
      ctx.lineTo(lastX, h - padding);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      for (let i = 0; i < pointsToDraw; i++) {
        const x = padding + (chartW / (data.length - 1)) * i;
        const y = padding + chartH - ((data[i] - minVal) / range) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = padding + (chartW / (data.length - 1)) * (i - 1);
          const prevY = padding + chartH - ((data[i - 1] - minVal) / range) * chartH;
          const cpx = (prevX + x) / 2;
          ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dot at the end
      if (pointsToDraw > 0) {
        const lastPoint = pointsToDraw - 1;
        const dotX = padding + (chartW / (data.length - 1)) * lastPoint;
        const dotY = padding + chartH - ((data[lastPoint] - minVal) / range) * chartH;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }

    function animateChart(data, color) {
      animationProgress = 0;
      const duration = 1500;
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        animationProgress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - animationProgress, 3);
        drawChart(data, color, eased);
        if (animationProgress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }

    // Initial animation
    animateChart(trendDatasets.ai.data, trendDatasets.ai.color);

    // Sidebar item click handler
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const chartKey = item.dataset.chart;
        const dataset = trendDatasets[chartKey];
        if (dataset) {
          animateChart(dataset.data, dataset.color);
          // Update metrics
          const metrics = {
            ai: { growth: '+34.2%', mentions: '1.2M', score: '92' },
            green: { growth: '+28.7%', mentions: '890K', score: '87' },
            remote: { growth: '-12.4%', mentions: '650K', score: '42' },
            crypto: { growth: '+45.1%', mentions: '2.1M', score: '78' }
          };
          const m = metrics[chartKey];
          if (m) {
            const metricEls = document.querySelectorAll('.metric-value');
            if (metricEls.length >= 3) {
              metricEls[0].textContent = m.growth;
              metricEls[1].textContent = m.mentions;
              metricEls[2].textContent = m.score;
            }
          }
        }
      });
    });

    // Tab click handler
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const activeSidebar = document.querySelector('.sidebar-item.active');
        const chartKey = activeSidebar ? activeSidebar.dataset.chart : 'ai';
        const dataset = trendDatasets[chartKey];
        if (dataset) animateChart(dataset.data, dataset.color);
      });
    });

    // Responsive canvas
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 300;
      const activeSidebar = document.querySelector('.sidebar-item.active');
      const chartKey = activeSidebar ? activeSidebar.dataset.chart : 'ai';
      const dataset = trendDatasets[chartKey];
      if (dataset) drawChart(dataset.data, dataset.color, 1);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Contact form handling ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      console.log('Form submitted:', data);

      // Show success message
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = '✓ Message Sent!';
      btn.style.background = 'var(--success)';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        contactForm.reset();
      }, 3000);
    });
  }

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isOpen = question.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.style.maxHeight = null;
      });
      // Toggle current
      if (!isOpen) {
        question.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});
