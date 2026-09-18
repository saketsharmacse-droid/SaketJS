import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  type: 'tilt',       // 'tilt' | 'reveal'
  intensity: 15,       // max rotation in degrees, used by 'tilt'
  scale: 1.08,         // zoom amount on hover
  overlayColor: 'rgba(0,0,0,0.35)' // used by 'reveal'
};

/**
 * Saket.imageHover(selector, options)
 * selector should match the *container* wrapping an <img> (or a
 * background-image div). SaketJS injects the required wrapper markup
 * if the container isn't already set up for it.
 */
export function imageHover(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const containers = resolveElements(selector);
  const cleanups = [];

  containers.forEach((container) => {
    if (!markInitialized(container, 'saketImageHover')) return;
    container.classList.add('saket-image-hover', `saket-image-hover--${opts.type}`);
    container.style.overflow = 'hidden';
    container.style.position = container.style.position || 'relative';

    const img = container.querySelector('img');

    if (opts.type === 'tilt') {
      function onMouseMove(e) {
        const rect = container.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(container, {
          rotateY: px * opts.intensity,
          rotateX: -py * opts.intensity,
          scale: opts.scale,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 600
        });
      }

      function onMouseLeave() {
        gsap.to(container, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out'
        });
      }

      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
      cleanups.push(() => {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', onMouseLeave);
      });
    }

    if (opts.type === 'reveal') {
      const overlay = document.createElement('div');
      overlay.className = 'saket-image-hover__overlay';
      overlay.style.background = opts.overlayColor;
      container.appendChild(overlay);
      gsap.set(overlay, { yPercent: 100 });

      function onEnter() {
        gsap.to(overlay, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
        if (img) gsap.to(img, { scale: opts.scale, duration: 0.6, ease: 'power2.out' });
      }
      function onLeave() {
        gsap.to(overlay, { yPercent: 100, duration: 0.5, ease: 'power3.in' });
        if (img) gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
      }

      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        container.removeEventListener('mouseenter', onEnter);
        container.removeEventListener('mouseleave', onLeave);
        overlay.remove();
      });
    }

    cleanups.push(() => delete container.dataset.saketImageHover);
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
