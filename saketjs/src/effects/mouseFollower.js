import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  type: 'dot',            // 'dot' | 'ring' | 'blob'
  size: 20,                // px, base size of the follower
  color: '#ffffff',
  ease: 0.15,              // trailing smoothness, lower = laggier/smoother
  hoverSelector: 'a, button, [data-saket-hover]', // elements that grow the follower
  hoverScale: 2.5,
  mixBlendMode: 'difference'
};

let activeFollowers = 0;

/**
 * Saket.mouseFollower(container, options)
 * container: a selector/element that scopes hover detection (default: document)
 * Creates a single custom cursor element that trails the real cursor.
 */
export function mouseFollower(container, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const scopeEl = container ? resolveElements(container)[0] : document.body;
  if (!scopeEl) return () => {};

  activeFollowers += 1;
  const id = `saket-follower-${activeFollowers}`;

  const el = document.createElement('div');
  el.className = `saket-follower saket-follower--${opts.type}`;
  el.id = id;
  el.style.width = `${opts.size}px`;
  el.style.height = `${opts.size}px`;
  el.style.setProperty('--saket-follower-color', opts.color);
  el.style.mixBlendMode = opts.mixBlendMode;
  document.body.appendChild(el);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let rafId = null;
  let scale = 1;

  gsap.set(el, { xPercent: -50, yPercent: -50 });

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function render() {
    // manual lerp loop keeps the trailing effect independent of GSAP's
    // own tween queue, so it stays smooth even while other tweens run
    currentX += (mouseX - currentX) * opts.ease;
    currentY += (mouseY - currentY) * opts.ease;
    gsap.set(el, { x: currentX, y: currentY });
    rafId = requestAnimationFrame(render);
  }

  function onEnterHover() {
    scale = opts.hoverScale;
    gsap.to(el, { scale, duration: 0.35, ease: 'power3.out' });
  }

  function onLeaveHover() {
    scale = 1;
    gsap.to(el, { scale, duration: 0.35, ease: 'power3.out' });
  }

  function onMouseLeaveWindow() {
    gsap.to(el, { opacity: 0, duration: 0.2 });
  }

  function onMouseEnterWindow() {
    gsap.to(el, { opacity: 1, duration: 0.2 });
  }

  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeaveWindow);
  document.addEventListener('mouseenter', onMouseEnterWindow);
  rafId = requestAnimationFrame(render);

  const hoverTargets = Array.from(scopeEl.querySelectorAll(opts.hoverSelector));
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', onEnterHover);
    target.addEventListener('mouseleave', onLeaveHover);
  });

  // hide the native cursor on the scoped area so the follower reads clearly
  scopeEl.classList.add('saket-cursor-hidden');

  /** Call the returned function to fully remove this follower + listeners. */
  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeaveWindow);
    document.removeEventListener('mouseenter', onMouseEnterWindow);
    hoverTargets.forEach((target) => {
      target.removeEventListener('mouseenter', onEnterHover);
      target.removeEventListener('mouseleave', onLeaveHover);
    });
    scopeEl.classList.remove('saket-cursor-hidden');
    el.remove();
  };
}
