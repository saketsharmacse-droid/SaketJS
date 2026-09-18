/**
 * Resolve a selector string, a single element, a NodeList, or an array
 * of elements into a plain array of elements. Every effect function
 * accepts any of these so the consumer never has to think about it.
 */
export function resolveElements(target) {
  if (!target) return [];
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll(target));
  }
  if (target instanceof Element) {
    return [target];
  }
  if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target);
  }
  return [];
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Merge user options over a set of defaults without mutating either.
 */
export function withDefaults(defaults, options) {
  return Object.assign({}, defaults, options || {});
}

/**
 * Tiny helper to avoid initializing the same effect twice on the same
 * element (e.g. if the consumer's script runs twice on hot reload).
 */
export function markInitialized(el, flag) {
  if (el.dataset[flag] === 'true') return false;
  el.dataset[flag] = 'true';
  return true;
}
