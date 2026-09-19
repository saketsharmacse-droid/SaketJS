import gsap from 'gsap';
import { resolveElements, withDefaults, markInitialized } from '../utils/dom.js';

const DEFAULTS = {
  color: '#000000',
  thickness: 2,
  height: 160,         // total vertical space the string is allowed to bow into
  restY: null,          // resting Y position of the string; defaults to height / 2
  strength: 1,           // 0-2+, how far the string bows toward the cursor
  padding: 10,            // horizontal inset so the string doesn't touch the container edges
  enterEase: 'power4.out',
  enterDuration: 0.4,
  leaveEase: 'elastic.out(1, 0.4)',
  leaveDuration: 0.7
};

/**
 * Saket.string(selector, options)
 * Turns any container into a flexible "string" divider: a line that
 * bows toward the cursor's vertical position as it moves across the
 * container, and springs back to a flat rest position on mouseleave.
 * SaketJS injects the SVG itself — you only need an empty container.
 *
 * <div class="my-divider"></div>
 * Saket.string('.my-divider', { color: '#8a7fff', strength: 1.4 });
 */
export function string(selector, options = {}) {
  const opts = withDefaults(DEFAULTS, options);
  const containers = resolveElements(selector);
  const cleanups = [];

  containers.forEach((container) => {
    if (!markInitialized(container, 'saketString')) return;

    container.classList.add('saket-string');
    if (!container.style.height) container.style.height = `${opts.height}px`;
    container.style.position = container.style.position || 'relative';
    container.style.overflow = container.style.overflow || 'visible';

    const restY = opts.restY != null ? opts.restY : opts.height / 2;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', opts.height);
    svg.style.display = 'block';
    svg.style.overflow = 'visible';
    svg.classList.add('saket-string__svg');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', opts.color);
    path.setAttribute('stroke-width', opts.thickness);
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    container.appendChild(svg);

    function buildD(width, controlY) {
      const pad = Math.min(opts.padding, width / 4);
      return `M ${pad} ${restY} Q ${width / 2} ${controlY} ${width - pad} ${restY}`;
    }

    function setRest() {
      const width = container.getBoundingClientRect().width;
      path.setAttribute('d', buildD(width, restY));
    }
    setRest();

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const offsetY = e.clientY - rect.top;
      const controlY = restY + (offsetY - restY) * opts.strength;

      gsap.to(path, {
        attr: { d: buildD(width, controlY) },
        duration: opts.enterDuration,
        ease: opts.enterEase,
        overwrite: true
      });
    }

    function onMouseLeave() {
      const width = container.getBoundingClientRect().width;
      gsap.to(path, {
        attr: { d: buildD(width, restY) },
        duration: opts.leaveDuration,
        ease: opts.leaveEase,
        overwrite: true
      });
    }

    function onResize() {
      setRest();
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);

    cleanups.push(() => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      svg.remove();
      container.classList.remove('saket-string');
      delete container.dataset.saketString;
    });
  });

  return function destroy() {
    cleanups.forEach((fn) => fn());
  };
}
