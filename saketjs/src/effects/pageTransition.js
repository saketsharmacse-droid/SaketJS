import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  color: '#111111',
  duration: 0.6,
  linkSelector: 'a[href]'
};

/**
 * Saket.pageTransition(options)
 * Works on plain multi-page sites (no router/SPA needed):
 *  1. An overlay covers the screen the instant the page loads (via CSS,
 *     see saketjs.css) so there's never a flash of unstyled content.
 *  2. On load, SaketJS wipes the overlay away to reveal the page.
 *  3. On click of an internal link, SaketJS wipes the overlay back in,
 *     then navigates — so every page-to-page jump feels continuous.
 */
export function pageTransition(options = {}) {
  const opts = withDefaults(DEFAULTS, options);

  let overlay = document.querySelector('.saket-page-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'saket-page-overlay';
    document.body.appendChild(overlay);
  }
  overlay.style.background = opts.color;

  // Reveal the current page.
  gsap.to(overlay, {
    yPercent: -100,
    duration: opts.duration,
    ease: 'power3.inOut'
  });

  function isInternalLink(link) {
    if (!link || !link.href) return false;
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;
    if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return false;
    try {
      const url = new URL(link.href);
      return url.origin === window.location.origin;
    } catch (err) {
      return false;
    }
  }

  function onClick(e) {
    const link = e.target.closest(opts.linkSelector);
    if (!isInternalLink(link)) return;

    const destination = link.href;
    // skip same-page anchor links so #section jumps aren't intercepted
    if (destination.split('#')[0] === window.location.href.split('#')[0]) return;

    e.preventDefault();
    gsap.set(overlay, { yPercent: -100 });
    gsap.to(overlay, {
      yPercent: 0,
      duration: opts.duration,
      ease: 'power3.inOut',
      onComplete: () => {
        window.location.href = destination;
      }
    });
  }

  document.addEventListener('click', onClick);

  return function destroy() {
    document.removeEventListener('click', onClick);
    overlay.remove();
  };
}
