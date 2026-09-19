import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  type: 'stagger',        // 'stagger' | 'scramble' | 'reveal3d'
  splitBy: 'char',         // 'char' | 'word', used by 'stagger' and 'reveal3d'
  stagger: 0.03,
  duration: 0.6,
  scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  scrambleSpeed: 30,       // ms between character flickers
  rotateX: -90,             // starting X rotation in degrees, used by 'reveal3d'
  rotateY: 0,                // starting Y rotation in degrees, used by 'reveal3d'
  perspective: 600,           // px, used by 'reveal3d'
  reverseOnLeave: true          // used by 'reveal3d' — re-hides when scrolled back past
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
 * 'reveal3d' -> splits text and reveals each unit with a 3D rotation
 *               (rotateX/rotateY) as it scrolls into view, reversing
 *               if it scrolls back out (unless reverseOnLeave: false).
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

    if (opts.type === 'reveal3d') {
      const spans = splitText(el, opts.splitBy);
      el.style.perspective = `${opts.perspective}px`;
      gsap.set(spans, {
        opacity: 0,
        rotateX: opts.rotateX,
        rotateY: opts.rotateY,
        transformOrigin: '50% 100%'
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const targetSpans = entry.target.querySelectorAll('span');
            if (entry.isIntersecting) {
              gsap.to(targetSpans, {
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                duration: opts.duration,
                stagger: opts.stagger,
                ease: 'power2.inOut'
              });
              if (!opts.reverseOnLeave) observer.unobserve(entry.target);
            } else if (opts.reverseOnLeave) {
              gsap.to(targetSpans, {
                opacity: 0,
                rotateX: opts.rotateX,
                rotateY: opts.rotateY,
                duration: opts.duration * 0.7,
                stagger: opts.stagger * 0.5,
                ease: 'power2.in'
              });
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
