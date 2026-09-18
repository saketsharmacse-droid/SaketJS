import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  speed: 60,          // px per second
  direction: 'left',  // 'left' | 'right'
  pauseOnHover: true
};

/**
 * Saket.marquee(selector, options)
 * Turns an element's content into a seamless, infinitely scrolling strip
 * — duplicates the content once internally so the loop has no visible seam.
 */
export function marquee(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketMarquee')) return;

    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';

    const track = document.createElement('div');
    track.className = 'saket-marquee-track';
    track.style.display = 'inline-flex';
    track.style.width = 'max-content';

    // Move all existing children into a "segment", then clone the
    // segment once so the two copies sit edge-to-edge for a seamless loop.
    const segment = document.createElement('div');
    segment.style.display = 'inline-flex';
    while (el.firstChild) segment.appendChild(el.firstChild);

    const segmentClone = segment.cloneNode(true);
    track.appendChild(segment);
    track.appendChild(segmentClone);
    el.appendChild(track);

    let distance = segment.getBoundingClientRect().width;
    const directionMultiplier = opts.direction === 'left' ? -1 : 1;
    let duration = distance / opts.speed;

    let tween = gsap.to(track, {
      x: directionMultiplier * distance,
      duration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => `${((parseFloat(x) % distance) + distance) % distance * directionMultiplier}px`
      }
    });

    function onEnter() {
      if (opts.pauseOnHover) tween.pause();
    }
    function onLeave() {
      if (opts.pauseOnHover) tween.resume();
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    cleanups.push(() => {
      tween.kill();
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      delete el.dataset.saketMarquee;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
