import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  svg: '',                 // raw <svg>...</svg> markup for your logo/mark
  strokeColor: '#ffffff',
  fillColor: '#ffffff',
  panelCount: 5,
  panelColor: '#0d0d0f',
  background: '#0d0d0f',
  drawDuration: 1.2,
  holdDuration: 0.4,
  panelDuration: 0.9,
  onComplete: null
};

/**
 * Saket.svgLoader(options)
 * A full-screen loader built around YOUR logo: the SVG strokes draw
 * themselves in, then a set of panels wipe away to reveal the page.
 * Pass your own logo mark via `svg` (a raw <svg>...</svg> string) — the
 * loader handles the reveal choreography around it.
 */
export function svgLoader(options = {}) {
  const opts = withDefaults(DEFAULTS, options);

  const wrapper = document.createElement('div');
  wrapper.className = 'saket-svg-loader';
  wrapper.style.background = opts.background;

  const markHolder = document.createElement('div');
  markHolder.className = 'saket-svg-loader__mark';
  markHolder.innerHTML = opts.svg;
  wrapper.appendChild(markHolder);

  const panelWrap = document.createElement('div');
  panelWrap.className = 'saket-svg-loader__panels';
  const panels = [];
  for (let i = 0; i < opts.panelCount; i++) {
    const panel = document.createElement('div');
    panel.className = 'saket-svg-loader__panel';
    panel.style.background = opts.panelColor;
    panelWrap.appendChild(panel);
    panels.push(panel);
  }
  wrapper.appendChild(panelWrap);
  document.body.appendChild(wrapper);

  // Style + animate every stroked path found inside the pasted SVG.
  const paths = markHolder.querySelectorAll('path, line, polyline, circle, rect');
  paths.forEach((el) => {
    if (el.hasAttribute('stroke') || el.tagName.toLowerCase() === 'path') {
      el.style.stroke = opts.strokeColor;
    }
    if (typeof el.getTotalLength === 'function') {
      try {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      } catch (err) {
        // element has no measurable length (e.g. a <rect> used as a mask) — skip
      }
    }
  });

  const tl = gsap.timeline({
    onComplete: () => {
      wrapper.remove();
      if (typeof opts.onComplete === 'function') opts.onComplete();
    }
  });

  tl.to(paths, {
    strokeDashoffset: 0,
    duration: opts.drawDuration,
    stagger: 0.1,
    ease: 'power2.inOut'
  });
  tl.to(markHolder, { scale: 0, duration: 0.4, ease: 'power2.in' }, `+=${opts.holdDuration}`);
  tl.to(panels, {
    yPercent: -100,
    duration: opts.panelDuration,
    stagger: 0.08,
    ease: 'power3.inOut'
  }, '-=0.1');
  tl.to(wrapper, { autoAlpha: 0, duration: 0.3 }, '-=0.2');

  return function destroy() {
    tl.kill();
    wrapper.remove();
  };
}
