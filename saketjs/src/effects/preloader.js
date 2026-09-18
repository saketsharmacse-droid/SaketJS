import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  background: '#0d0d0f',
  text: '',                // optional loading text/logo (plain text)
  minDuration: 0.6,        // seconds the loader stays visible at minimum
  onComplete: null         // optional callback fired after the loader hides
};

/**
 * Saket.preloader(options)
 * Shows a full-screen loader immediately (inline, so there's no flash),
 * then fades it out once the window's `load` event fires (or minDuration
 * has passed, whichever is later).
 */
export function preloader(options = {}) {
  const opts = withDefaults(DEFAULTS, options);

  let el = document.querySelector('.saket-preloader');
  if (!el) {
    el = document.createElement('div');
    el.className = 'saket-preloader';
    if (opts.text) {
      const label = document.createElement('div');
      label.className = 'saket-preloader__text';
      label.textContent = opts.text;
      el.appendChild(label);
    }
    document.body.appendChild(el);
  }
  el.style.background = opts.background;

  const startTime = performance.now();

  function hide() {
    const elapsed = (performance.now() - startTime) / 1000;
    const wait = Math.max(0, opts.minDuration - elapsed);
    setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          el.remove();
          if (typeof opts.onComplete === 'function') opts.onComplete();
        }
      });
    }, wait * 1000);
  }

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }

  return function destroy() {
    window.removeEventListener('load', hide);
    el.remove();
  };
}
