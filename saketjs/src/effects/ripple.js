import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  color: 'rgba(255,255,255,0.5)',
  duration: 0.6
};

/**
 * Saket.ripple(selector, options)
 * Adds a Material-style expanding ripple centered on the click point.
 */
export function ripple(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketRipple')) return;

    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';

    function onClick(e) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const span = document.createElement('span');
      span.className = 'saket-ripple';
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      span.style.background = opts.color;
      el.appendChild(span);

      gsap.fromTo(
        span,
        { scale: 0, opacity: 0.6 },
        {
          scale: 1,
          opacity: 0,
          duration: opts.duration,
          ease: 'power2.out',
          onComplete: () => span.remove()
        }
      );
    }

    el.addEventListener('click', onClick);
    cleanups.push(() => {
      el.removeEventListener('click', onClick);
      delete el.dataset.saketRipple;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
