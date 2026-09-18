import gsap from 'gsap';
import { withDefaults } from '../utils/dom.js';

const DEFAULTS = {
  color: '#111111',
  duration: 0.6,
  linkSelector: 'a[href]',
  type: 'wipe',       // 'wipe' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'fade' | 'scaleFade'
  mode: 'reload',     // 'reload' (full navigation) | 'ajax' (fetch + swap a container, no reload)
  containerSelector: '[data-saket-transition-container]', // only used when mode: 'ajax'
  onNavigate: null    // ajax mode only: fires after new content is swapped in, so you can
                       // re-run any per-page Saket effects (magnet, ripple, etc.) on it
};

// Each named type maps to a "covered" state and a "revealed" state for
// the overlay. coverIn animates from revealed -> covered (before
// navigating/fetching); revealOut animates from covered -> revealed
// (after the new content is ready).
function getStates(type) {
  switch (type) {
    case 'slideLeft':
      return { revealed: { xPercent: -100 }, covered: { xPercent: 0 }, exit: { xPercent: 100 } };
    case 'slideRight':
      return { revealed: { xPercent: 100 }, covered: { xPercent: 0 }, exit: { xPercent: -100 } };
    case 'slideDown':
      return { revealed: { yPercent: -100 }, covered: { yPercent: 0 }, exit: { yPercent: 100 } };
    case 'fade':
      return { revealed: { opacity: 0 }, covered: { opacity: 1 }, exit: { opacity: 0 } };
    case 'scaleFade':
      return {
        revealed: { opacity: 0, scale: 0.85 },
        covered: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.15 }
      };
    case 'slideUp':
    case 'wipe':
    default:
      return { revealed: { yPercent: -100 }, covered: { yPercent: 0 }, exit: { yPercent: -100 } };
  }
}

function isInternalLink(link) {
  if (!link || !link.href) return false;
  if (link.target === '_blank') return false;
  if (link.hasAttribute('download')) return false;
  if (link.hasAttribute('data-saket-no-transition')) return false;
  if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return false;
  try {
    const url = new URL(link.href);
    return url.origin === window.location.origin;
  } catch (err) {
    return false;
  }
}

/**
 * Saket.pageTransition(options)
 *
 * mode: 'reload' (default) — works on any plain multi-page site:
 *   1. An overlay covers the screen the instant the page loads (via CSS,
 *      see saketjs.css) so there's never a flash of unstyled content.
 *   2. On load, SaketJS reveals the overlay to show the page.
 *   3. On click of an internal link, SaketJS covers the overlay again,
 *      then does a real navigation — every page-to-page jump feels
 *      continuous even though the browser is doing a full page load.
 *
 * mode: 'ajax' — inspired by Barba.js: instead of a full page reload,
 *   SaketJS fetches the destination page's HTML, swaps just the element
 *   matching `containerSelector` (so your header/nav never flickers or
 *   re-runs), updates the URL via the History API, then reveals the
 *   overlay. Call `Saket.pageTransition({ mode: 'ajax' })` once, and make
 *   sure the SAME element (e.g. `<main data-saket-transition-container>`)
 *   exists, with that exact attribute, on every page of your site.
 */
export function pageTransition(options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const states = getStates(opts.type);

  let overlay = document.querySelector('.saket-page-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'saket-page-overlay';
    document.body.appendChild(overlay);
  }
  overlay.style.background = opts.color;

  gsap.set(overlay, states.covered);
  gsap.to(overlay, {
    ...states.revealed,
    duration: opts.duration,
    ease: 'power3.inOut'
  });

  function coverIn(onComplete) {
    gsap.to(overlay, {
      ...states.covered,
      duration: opts.duration,
      ease: 'power3.inOut',
      onComplete
    });
  }

  function revealOut() {
    gsap.set(overlay, states.covered);
    gsap.to(overlay, {
      ...states.revealed,
      duration: opts.duration,
      ease: 'power3.inOut'
    });
  }

  async function swapContent(destination, pushHistory) {
    const response = await fetch(destination);
    const html = await response.text();
    const nextDoc = new DOMParser().parseFromString(html, 'text/html');

    const currentContainer = document.querySelector(opts.containerSelector);
    const nextContainer = nextDoc.querySelector(opts.containerSelector);

    if (!currentContainer || !nextContainer) {
      console.warn(
        `[SaketJS] pageTransition (ajax mode): couldn't find "${opts.containerSelector}" ` +
        'on the current or destination page. Falling back to a full page load.'
      );
      window.location.href = destination;
      return;
    }

    currentContainer.innerHTML = nextContainer.innerHTML;
    document.title = nextDoc.title;

    if (pushHistory) {
      window.history.pushState({ saketAjax: true }, '', destination);
    }

    if (typeof opts.onNavigate === 'function') opts.onNavigate(destination);
    revealOut();
  }

  function onClick(e) {
    const link = e.target.closest(opts.linkSelector);
    if (!isInternalLink(link)) return;

    const destination = link.href;
    if (destination.split('#')[0] === window.location.href.split('#')[0]) return;

    e.preventDefault();

    if (opts.mode === 'ajax') {
      coverIn(() => swapContent(destination, true));
    } else {
      coverIn(() => {
        window.location.href = destination;
      });
    }
  }

  function onPopState() {
    if (opts.mode !== 'ajax') return;
    coverIn(() => swapContent(window.location.href, false));
  }

  document.addEventListener('click', onClick);
  if (opts.mode === 'ajax') {
    window.addEventListener('popstate', onPopState);
  }

  return function destroy() {
    document.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
    overlay.remove();
  };
}
