import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  images: [],          // array of image URLs to cycle through
  interval: 250,         // ms between frames
  trigger: 'auto',        // 'auto' (always cycling) | 'hover' (cycles only while hovered)
  loop: true
};

/**
 * Saket.imageSequence(selector, options)
 * Cycles an <img>'s src through a list of images — useful for a hero
 * image that flickers through a sequence, or a hover-scrub product
 * preview.
 */
export function imageSequence(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const elements = resolveElements(selector);
  const cleanups = [];

  if (!opts.images.length) {
    console.warn('[SaketJS] imageSequence: no `images` array was provided — nothing to cycle.');
    return () => {};
  }

  elements.forEach((img) => {
    if (!markInitialized(img, 'saketImageSequence')) return;
    if (img.tagName.toLowerCase() !== 'img') {
      console.warn('[SaketJS] imageSequence: target is not an <img> element, skipping.', img);
      return;
    }

    let index = 0;
    let intervalId = null;

    function nextFrame() {
      index = index >= opts.images.length - 1 ? (opts.loop ? 0 : index) : index + 1;
      img.src = opts.images[index];
    }

    function start() {
      if (intervalId) return;
      intervalId = setInterval(nextFrame, opts.interval);
    }

    function stop() {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (opts.trigger === 'auto') {
      start();
    } else if (opts.trigger === 'hover') {
      img.addEventListener('mouseenter', start);
      img.addEventListener('mouseleave', stop);
      cleanups.push(() => {
        img.removeEventListener('mouseenter', start);
        img.removeEventListener('mouseleave', stop);
      });
    }

    cleanups.push(() => {
      stop();
      delete img.dataset.saketImageSequence;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
