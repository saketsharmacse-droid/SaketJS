import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  particleCount: 80,
  color: '#8a7fff',
  linkColor: '#8a7fff',
  linkDistance: 140,
  linkOpacity: 0.25,
  particleSize: 2,
  speed: 0.4,
  interactive: true,     // particles get pushed away from the cursor
  repulseDistance: 100,
  repulseStrength: 1.5
};

/**
 * Saket.particleNetwork(selector, options)
 * A lightweight canvas-based "connected dots" background — no external
 * particle library, just <canvas> + requestAnimationFrame. Particles
 * drift, link to nearby neighbors with a line, and (optionally) get
 * pushed away from the cursor.
 */
export function particleNetwork(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const containers = resolveElements(selector);
  const cleanups = [];

  containers.forEach((container) => {
    if (!markInitialized(container, 'saketParticleNetwork')) return;

    container.style.position = container.style.position || 'relative';
    container.style.overflow = container.style.overflow || 'hidden';

    const canvas = document.createElement('canvas');
    canvas.className = 'saket-particle-network';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height, dpr;
    let particles = [];
    let mouse = { x: null, y: null };
    let rafId = null;

    function resize() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = Array.from({ length: opts.particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * opts.speed,
        vy: (Math.random() - 0.5) * opts.speed
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (opts.interactive && mouse.x != null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < opts.repulseDistance && dist > 0) {
            const force = (opts.repulseDistance - dist) / opts.repulseDistance;
            p.x += (dx / dist) * force * opts.repulseStrength;
            p.y += (dy / dist) * force * opts.repulseStrength;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, opts.particleSize, 0, Math.PI * 2);
        ctx.fillStyle = opts.color;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < opts.linkDistance) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = opts.linkColor;
            ctx.globalAlpha = opts.linkOpacity * (1 - dist / opts.linkDistance);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    function onResize() {
      resize();
      createParticles();
    }

    resize();
    createParticles();
    rafId = requestAnimationFrame(step);

    window.addEventListener('resize', onResize);
    if (opts.interactive) {
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
    }

    cleanups.push(() => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      canvas.remove();
      delete container.dataset.saketParticleNetwork;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
