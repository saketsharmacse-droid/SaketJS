import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  background: '#0d0d0f',
  textColor: '#ffffff',
  barCount: 8,
  barColor: '#111111',
  minStep: 1,
  maxStep: 10,
  tickDelayMin: 40,
  tickDelayMax: 160,
  holdDuration: 0.3,
  barDuration: 1.2,
  fontSize: '5rem',
  onComplete: null
};

/**
 * Saket.counterLoader(options)
 * A full-screen loader that counts up to 100% at a slightly randomized
 * pace (feels more "alive" than a linear progress bar), then a row of
 * bars shrinks away to reveal the page.
 */
export function counterLoader(options = {}) {
  const opts = withDefaults(DEFAULTS, options);

  const wrapper = document.createElement('div');
  wrapper.className = 'saket-counter-loader';
  wrapper.style.background = opts.background;

  const counter = document.createElement('div');
  counter.className = 'saket-counter-loader__counter';
  counter.style.color = opts.textColor;
  counter.style.fontSize = opts.fontSize;
  counter.textContent = '0';
  wrapper.appendChild(counter);

  const barWrap = document.createElement('div');
  barWrap.className = 'saket-counter-loader__bars';
  const bars = [];
  for (let i = 0; i < opts.barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'saket-counter-loader__bar';
    bar.style.background = opts.barColor;
    barWrap.appendChild(bar);
    bars.push(bar);
  }
  wrapper.appendChild(barWrap);
  document.body.appendChild(wrapper);

  let current = 0;
  let timeoutId = null;

  function tick() {
    if (current >= 100) {
      finish();
      return;
    }
    current += Math.floor(Math.random() * (opts.maxStep - opts.minStep + 1)) + opts.minStep;
    if (current > 100) current = 100;
    counter.textContent = String(current);

    const delay = Math.floor(Math.random() * (opts.tickDelayMax - opts.tickDelayMin + 1)) + opts.tickDelayMin;
    timeoutId = setTimeout(tick, delay);
  }

  function finish() {
    const tl = gsap.timeline({
      onComplete: () => {
        wrapper.remove();
        if (typeof opts.onComplete === 'function') opts.onComplete();
      }
    });
    tl.to(counter, { opacity: 0, duration: 0.25 });
    tl.to(bars, {
      yPercent: -100,
      duration: opts.barDuration,
      stagger: { amount: opts.barDuration * 0.5 },
      ease: 'power3.inOut'
    }, `-=${opts.holdDuration}`);
  }

  tick();

  return function destroy() {
    clearTimeout(timeoutId);
    wrapper.remove();
  };
}
