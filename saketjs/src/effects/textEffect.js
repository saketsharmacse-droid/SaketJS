import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  type: 'stagger',        // 'stagger' | 'scramble'
  splitBy: 'char',         // 'char' | 'word', used by 'stagger'
  stagger: 0.03,
  duration: 0.6,
  scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  scrambleSpeed: 30        // ms between character flickers
};

function splitText(el, splitBy) {
  const text = el.textContent;
  el.textContent = '';
  const units = splitBy === 'word' ? text.split(/(\s+)/) : text.split('');

  const spans = units.map((unit) => {
    const span = document.createElement('span');
    span.textContent = unit;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    el.appendChild(span);
    return span;
  });
  return spans;
}

/**
 * Saket.textEffect(selector, options)
 * 'stagger'  -> splits text and reveals it word-by-word/char-by-char
 *               the first time the element scrolls into view.
 * 'scramble' -> on hover, shuffles the text through random characters
 *               before resolving back to the original text.
 */
export function textEffect(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  elements.forEach((el) => {
    if (!markInitialized(el, 'saketTextEffect')) return;

    if (opts.type === 'stagger') {
      const spans = splitText(el, opts.splitBy);
      gsap.set(spans, { yPercent: 120, opacity: 0 });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target.querySelectorAll('span'), {
                yPercent: 0,
                opacity: 1,
                duration: opts.duration,
                stagger: opts.stagger,
                ease: 'power3.out'
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      cleanups.push(() => observer.disconnect());
    }

    if (opts.type === 'scramble') {
      const original = el.textContent;
      let interval = null;

      function scramble() {
        let iteration = 0;
        clearInterval(interval);
        interval = setInterval(() => {
          el.textContent = original
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return original[index];
              return opts.scrambleChars[
                Math.floor(Math.random() * opts.scrambleChars.length)
              ];
            })
            .join('');

          if (iteration >= original.length) clearInterval(interval);
          iteration += 1 / 3;
        }, opts.scrambleSpeed);
      }

      function reset() {
        clearInterval(interval);
        el.textContent = original;
      }

      el.addEventListener('mouseenter', scramble);
      el.addEventListener('mouseleave', reset);
      cleanups.push(() => {
        clearInterval(interval);
        el.removeEventListener('mouseenter', scramble);
        el.removeEventListener('mouseleave', reset);
        el.textContent = original;
      });
    }

    cleanups.push(() => delete el.dataset.saketTextEffect);
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
