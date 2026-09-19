import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const SHAPES = {
  diamond: {
    closed: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)',
    open: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  },
  rectLeft: {
    closed: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
    open: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  },
  rectUp: {
    closed: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
    open: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  },
  circle: {
    closed: 'circle(0% at 50% 50%)',
    open: 'circle(75% at 50% 50%)'
  }
};

const DEFAULTS = {
  shape: 'diamond',      // 'diamond' | 'rectLeft' | 'rectUp' | 'circle'
  duration: 1,
  ease: 'power3.inOut',
  trigger: 'view'          // 'view' (reveals when scrolled into view) | 'immediate'
};

/**
 * Saket.clipTitle(selector, options)
 * Reveals a title/block by animating its clip-path open — starts as a
 * sliver (a line, a point, whatever the shape's closed state is) and
 * expands to show the full element.
 */
export function clipTitle(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const shape = SHAPES[opts.shape] || SHAPES.diamond;
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketClipTitle')) return;

    gsap.set(el, { clipPath: shape.closed, opacity: 1 });

    function reveal() {
      gsap.to(el, {
        clipPath: shape.open,
        duration: opts.duration,
        ease: opts.ease
      });
    }

    if (opts.trigger === 'immediate') {
      reveal();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      cleanups.push(() => observer.disconnect());
    }

    cleanups.push(() => delete el.dataset.saketClipTitle);
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
