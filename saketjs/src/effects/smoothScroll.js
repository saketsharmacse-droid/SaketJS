import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  wrapperSelector: '[data-saket-scroll]', // element wrapping all scrollable content
  ease: 0.1,                              // lower = smoother/heavier trailing
  direction: 'vertical'                   // 'vertical' | 'horizontal'
};

/**
 * Saket.smoothScroll(options)
 * A tiny dependency-free stand-in for Locomotive Scroll: fakes native
 * scroll with a lerped transform, giving that "heavy, cinematic" feel
 * without pulling in an extra library.
 *
 * Usage:
 *   <div data-saket-scroll>...all your page content...</div>
 *   Saket.smoothScroll();
 */
export function smoothScroll(options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const wrapper = document.querySelector(opts.wrapperSelector);
  if (!wrapper) {
    console.warn(
      `[SaketJS] smoothScroll: no element found for "${opts.wrapperSelector}". ` +
      'Wrap your page content in a matching element first.'
    );
    return () => {};
  }

  const isVertical = opts.direction === 'vertical';

  // Fake the real scrollbar height/width so native scroll still works
  // (mouse wheel, keyboard, scrollbar drag) — we just intercept the
  // *visual* position of the content.
  function setBodyHeight() {
    if (isVertical) {
      document.body.style.height = `${wrapper.getBoundingClientRect().height}px`;
    } else {
      document.body.style.width = `${wrapper.getBoundingClientRect().width}px`;
    }
  }

  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100%';
  wrapper.style.willChange = 'transform';

  let current = 0;
  let target = 0;
  let rafId = null;

  setBodyHeight();

  function onScroll() {
    target = isVertical ? window.scrollY : window.scrollX;
  }

  function onResize() {
    setBodyHeight();
  }

  function render() {
    current += (target - current) * opts.ease;
    const value = Math.round(current * 100) / 100;
    gsap.set(wrapper, isVertical ? { y: -value } : { x: -value });
    rafId = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  rafId = requestAnimationFrame(render);

  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.body.style.height = '';
    document.body.style.width = '';
    wrapper.style.position = '';
    wrapper.style.transform = '';
  };
}
