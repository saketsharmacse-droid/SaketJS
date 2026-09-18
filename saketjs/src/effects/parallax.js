import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  speed: 0.3        // -1..1, negative moves opposite to scroll, 0 = static
};

/**
 * Saket.parallax(selector, options)
 * Moves matched elements at a different rate than the page scrolls,
 * only while they're near the viewport (cheap — uses IntersectionObserver
 * to toggle a scroll listener on/off per element).
 */
export function parallax(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketParallax')) return;

    let ticking = false;

    function update() {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elCenter - viewportCenter;
      gsap.set(el, { y: -distanceFromCenter * opts.speed });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.addEventListener('scroll', onScroll, { passive: true });
            update();
          } else {
            window.removeEventListener('scroll', onScroll);
          }
        });
      },
      { rootMargin: '50% 0px 50% 0px' }
    );

    observer.observe(el);
    cleanups.push(() => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      delete el.dataset.saketParallax;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
