import gsap from 'gsap';
import { resolveElements, withDefaults, clamp, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  strength: 0.5,     // 0–1, how strongly the element follows the cursor
  radius: 80,         // px beyond the element's own box that still triggers the pull
  ease: 0.3,          // seconds, snap-back speed
  scaleOnHover: 1     // set >1 (e.g. 1.05) to also grow slightly while pulled
};

/**
 * Saket.magnet(selector, options)
 * Makes matched elements gently follow the cursor while it's nearby,
 * and spring back to rest on mouseleave.
 */
export function magnet(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketMagnet')) return;

    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      const x = clamp(distX * opts.strength, -rect.width, rect.width);
      const y = clamp(distY * opts.strength, -rect.height, rect.height);

      gsap.to(el, {
        x,
        y,
        scale: opts.scaleOnHover,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    function onMouseLeave() {
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: opts.ease,
        ease: 'elastic.out(1, 0.4)'
      });
    }

    // Expand the hit area beyond the element's own box using the
    // parent as the listener target, then checking distance.
    const parent = el.parentElement || document.body;

    function onParentMouseMove(e) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const maxDist = Math.max(rect.width, rect.height) / 2 + opts.radius;

      if (dist <= maxDist) {
        onMouseMove(e);
      } else {
        onMouseLeave();
      }
    }

    parent.addEventListener('mousemove', onParentMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    cleanups.push(() => {
      parent.removeEventListener('mousemove', onParentMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      delete el.dataset.saketMagnet;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
