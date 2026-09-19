# SaketJS

[![npm version](https://img.shields.io/npm/v/saketjs.svg)](https://www.npmjs.com/package/saketjs)
[![npm downloads](https://img.shields.io/npm/dm/saketjs.svg)](https://www.npmjs.com/package/saketjs)
[![license](https://img.shields.io/npm/l/saketjs.svg)](https://github.com/saketsharmacse-droid/SaketJS/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/saketjs)](https://bundlephobia.com/package/saketjs)

A lightweight vanilla JS effects library — **mouse followers, magnetic buttons, image hover effects, text animations, smooth scroll, parallax, marquees, ripples, a preloader, and multi-style page transitions** (with an optional Barba-style AJAX mode) — inspired by [Shery.js](https://github.com/aayushchouhan24/sheryjs), rebuilt smaller and simpler.

No framework required. No separate GSAP install required — it's bundled inside. **One command in your terminal, one import, you're animating.**

```bash
npm install saketjs
```

## Quick Start

```js
import Saket from 'saketjs';
import 'saketjs/dist/saketjs.css';

Saket.mouseFollower('body', { type: 'ring' });
Saket.magnet('.magnet-btn');
Saket.textEffect('h1', { type: 'stagger' });
Saket.pageTransition({ type: 'fade' });
```

That's the entire setup — GSAP is bundled inside the package itself, so `npm install saketjs` is the only install command you ever need to run. No `npm install gsap` separately, no peer dependency warnings.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference) — all 10 effects
- [Building from source](#building-from-source)
- [License](#license)

## Installation

Run this in your project's terminal:

```bash
npm install saketjs
```

This adds `saketjs` (and its one bundled dependency, `gsap`) to your `package.json` and downloads it into `node_modules`. You're ready to `import` it right away — see [Usage](#usage) below.

## Usage

### With a bundler (Webpack / Vite / Parcel / Next.js etc.) — recommended after `npm install`

```js
import Saket from 'saketjs';
import 'saketjs/dist/saketjs.css';

Saket.mouseFollower('body', { type: 'ring' });
```

### Without a bundler (plain HTML page)

Copy `node_modules/saketjs/dist/saketjs.umd.js` and `saketjs.css` next to your HTML, or reference them directly:

```html
<link rel="stylesheet" href="node_modules/saketjs/dist/saketjs.css" />

<script src="node_modules/saketjs/dist/saketjs.umd.js"></script>
<script>
  Saket.mouseFollower('body', { type: 'ring' });
</script>
```

That's it — GSAP is already bundled inside `saketjs.umd.js`, so there is nothing else to include.

---

## API Reference

### 1. `Saket.mouseFollower(container, options)`

A custom cursor that trails the real mouse pointer.

| Option | Default | Description |
|---|---|---|
| `type` | `'dot'` | `'dot'` \| `'ring'` \| `'blob'` |
| `size` | `20` | Diameter in px |
| `color` | `'#ffffff'` | Follower color |
| `ease` | `0.15` | Trailing smoothness (lower = smoother/laggier) |
| `hoverSelector` | `'a, button, [data-saket-hover]'` | Elements that scale the follower up on hover |
| `hoverScale` | `2.5` | Scale factor while hovering a target |
| `mixBlendMode` | `'difference'` | CSS blend mode applied to the follower |

```js
Saket.mouseFollower('body', { type: 'blob', color: '#8a7fff', size: 30 });
```

Returns a `destroy()` function you can call to remove the follower and its listeners.

---

### 2. `Saket.magnet(selector, options)`

Pulls matched elements toward the cursor when it's nearby, and springs them back on `mouseleave`.

| Option | Default | Description |
|---|---|---|
| `strength` | `0.5` | 0–1, how strongly the element follows the cursor |
| `radius` | `80` | Extra px beyond the element's own box that still triggers the pull |
| `ease` | `0.3` | Seconds, snap-back speed |
| `scaleOnHover` | `1` | Set e.g. `1.05` to also grow slightly while pulled |

```js
Saket.magnet('.magnet-btn', { strength: 0.6, radius: 100 });
```

---

### 3. `Saket.imageHover(selector, options)`

`selector` should match a container wrapping an `<img>` (or a background-image div).

| Option | Default | Description |
|---|---|---|
| `type` | `'tilt'` | `'tilt'` \| `'reveal'` |
| `intensity` | `15` | Max tilt rotation in degrees (`'tilt'` only) |
| `scale` | `1.08` | Zoom amount on hover |
| `overlayColor` | `'rgba(0,0,0,0.35)'` | Overlay color swept across the image (`'reveal'` only) |

```js
Saket.imageHover('.project-thumb', { type: 'reveal', overlayColor: 'rgba(138,127,255,0.5)' });
```

---

### 4. `Saket.textEffect(selector, options)`

| Option | Default | Description |
|---|---|---|
| `type` | `'stagger'` | `'stagger'` (reveal on scroll) \| `'scramble'` (shuffle on hover) \| `'reveal3d'` (3D rotated reveal on scroll) |
| `splitBy` | `'char'` | `'char'` \| `'word'` (`'stagger'`/`'reveal3d'` only) |
| `stagger` | `0.03` | Delay between each unit's animation |
| `duration` | `0.6` | Animation duration per unit |
| `scrambleChars` | `A–Z` | Character set used while scrambling |
| `scrambleSpeed` | `30` | ms between character flickers (`'scramble'` only) |
| `rotateX` / `rotateY` | `-90` / `0` | Starting rotation in degrees (`'reveal3d'` only) |
| `perspective` | `600` | px, 3D depth (`'reveal3d'` only) |
| `reverseOnLeave` | `true` | Re-hides when scrolled back past (`'reveal3d'` only) |

```js
Saket.textEffect('h1.headline', { type: 'stagger', splitBy: 'word' });
Saket.textEffect('.nav-link', { type: 'scramble' });
Saket.textEffect('h1.hero-title', { type: 'reveal3d', splitBy: 'word' });
```

---

### 5. `Saket.pageTransition(options)`

Two ways to use it:

**`mode: 'reload'` (default)** — works on any plain multi-page site, no router needed. Covers the overlay on link click, does a real navigation, then reveals it on the next page's load.

**`mode: 'ajax'`** — inspired by Barba.js: instead of a full page reload, fetches the destination page's HTML and swaps just one container's contents, so your header/nav never flickers or re-initializes. Requires the *same* element, with the *same* attribute, present on every page:

```html
<!-- identical wrapper on every page of your site -->
<main data-saket-transition-container>
  ...page-specific content...
</main>
```
```js
Saket.pageTransition({ mode: 'ajax', type: 'slideLeft' });
```

| Option | Default | Description |
|---|---|---|
| `color` | `'#111111'` | Overlay color |
| `duration` | `0.6` | Animation duration in seconds |
| `linkSelector` | `'a[href]'` | Which links trigger the transition |
| `type` | `'wipe'` | `'wipe'` \| `'slideLeft'` \| `'slideRight'` \| `'slideUp'` \| `'slideDown'` \| `'fade'` \| `'scaleFade'` \| `'scribble'` |
| `scribbleThickness` | `'250vmax'` | How thick the scribble stroke grows to fully cover the screen (`'scribble'` only) |
| `mode` | `'reload'` | `'reload'` \| `'ajax'` |
| `containerSelector` | `'[data-saket-transition-container]'` | Element swapped in `'ajax'` mode |
| `onNavigate` | `null` | `'ajax'` mode only — callback fired after new content is swapped in, so you can re-run any per-page effects (`magnet`, `ripple`, etc.) on the fresh DOM |

```js
Saket.pageTransition({ color: '#0d0d0f', type: 'fade' });
```

Call this once per page (near the bottom of your `<body>`), on every page of your site, so the transition stays consistent across navigation.

To skip the transition on a specific link (e.g. a download link), add `data-saket-no-transition` to it.

**Note:** `saketjs.css` keeps the overlay visible by default so there's no flash of unstyled content before JS runs. This means the page assumes JavaScript is enabled; that's expected for an effects library like this. In `'ajax'` mode, remember that any Saket effects targeting elements *inside* the swapped container need to be re-initialized after navigation — use the `onNavigate` callback for that.

---

### 6. `Saket.smoothScroll(options)`

A tiny dependency-free stand-in for Locomotive Scroll — fakes native scroll with a lerped transform for that heavier, cinematic feel.

```html
<div data-saket-scroll>
  <!-- all your page content goes inside here -->
</div>
```
```js
Saket.smoothScroll({ ease: 0.1 });
```

| Option | Default | Description |
|---|---|---|
| `wrapperSelector` | `'[data-saket-scroll]'` | The element wrapping all scrollable content |
| `ease` | `0.1` | Lower = smoother/heavier trailing |
| `direction` | `'vertical'` | `'vertical'` \| `'horizontal'` |

---

### 7. `Saket.parallax(selector, options)`

Moves matched elements at a different speed than the page scroll.

| Option | Default | Description |
|---|---|---|
| `speed` | `0.3` | -1..1 — negative reverses direction, 0 disables movement |

```js
Saket.parallax('.hero-image', { speed: -0.2 });
```

---

### 8. `Saket.marquee(selector, options)`

Turns any element's content into a seamless, infinitely scrolling strip.

| Option | Default | Description |
|---|---|---|
| `speed` | `60` | px per second |
| `direction` | `'left'` | `'left'` \| `'right'` |
| `pauseOnHover` | `true` | Pause the scroll while the cursor is over it |

```js
Saket.marquee('.logo-strip', { speed: 80, direction: 'right' });
```

---

### 9. `Saket.ripple(selector, options)`

Material-style expanding ripple centered on the click point.

| Option | Default | Description |
|---|---|---|
| `color` | `'rgba(255,255,255,0.5)'` | Ripple color |
| `duration` | `0.6` | Seconds for the ripple to expand and fade |

```js
Saket.ripple('button', { color: 'rgba(138,127,255,0.6)' });
```

---

### 10. `Saket.preloader(options)`

Full-screen loader shown immediately on page load, fading out once the page (and all assets) finish loading.

| Option | Default | Description |
|---|---|---|
| `background` | `'#0d0d0f'` | Loader background color |
| `text` | `''` | Optional loading text/logo |
| `minDuration` | `0.6` | Minimum seconds the loader stays visible, even if the page loads instantly |
| `onComplete` | `null` | Callback fired right after the loader is removed |

```js
Saket.preloader({ text: 'LOADING', minDuration: 1 });
```

---

### 11. `Saket.string(selector, options)`

Turns any empty container into a flexible "string" divider — a line that bows toward the cursor's vertical position as it moves across the container, and springs back to a flat rest position on `mouseleave`. Pure SVG + GSAP, no Three.js/WebGL involved, so it stays lightweight.

```html
<div class="my-divider"></div>
```
```js
Saket.string('.my-divider', {
  color: '#8a7fff',
  thickness: 2,
  height: 160,
  strength: 1.2
});
```

| Option | Default | Description |
|---|---|---|
| `color` | `'#000000'` | Line color |
| `thickness` | `2` | Stroke width in px |
| `height` | `160` | Total vertical space (in px) the string is allowed to bow into |
| `restY` | `null` | Resting Y position of the string; defaults to `height / 2` (centered) |
| `strength` | `1` | 0–2+, how far the string bows toward the cursor — higher is more elastic/exaggerated |
| `padding` | `10` | Horizontal inset so the string doesn't touch the container's edges |
| `enterEase` | `'power4.out'` | Easing while the string follows the cursor |
| `enterDuration` | `0.4` | Seconds to catch up to the cursor |
| `leaveEase` | `'elastic.out(1, 0.4)'` | Easing for the spring-back on mouseleave |
| `leaveDuration` | `0.7` | Seconds for the spring-back animation |

You don't need to write any SVG yourself — SaketJS injects it into the container automatically, sized to the container's own width, and re-measures on window resize.

---

### 12. `Saket.svgLoader(options)`

A full-screen loader built around your own logo mark: it draws your SVG's strokes in, then a set of panels wipe away to reveal the page.

```js
Saket.svgLoader({
  svg: '<svg viewBox="0 0 134 229">...your logo markup...</svg>',
  strokeColor: '#ffffff',
  panelCount: 5,
  panelColor: '#0d0d0f',
  onComplete: () => console.log('loader done')
});
```

| Option | Default | Description |
|---|---|---|
| `svg` | `''` | Raw `<svg>...</svg>` markup for your logo/mark — required |
| `strokeColor` | `'#ffffff'` | Color applied to the logo's strokes as they draw in |
| `panelCount` | `5` | Number of vertical panels used for the reveal wipe |
| `panelColor` | `'#0d0d0f'` | Panel color |
| `background` | `'#0d0d0f'` | Loader background, behind the logo |
| `drawDuration` | `1.2` | Seconds for the logo's strokes to draw in |
| `holdDuration` | `0.4` | Pause after drawing, before the panels wipe |
| `panelDuration` | `0.9` | Seconds for the panel wipe |
| `onComplete` | `null` | Callback fired after the loader is fully removed |

---

### 13. `Saket.counterLoader(options)`

A full-screen loader that counts up to 100% at a slightly randomized pace, then a row of bars shrinks away to reveal the page.

```js
Saket.counterLoader({
  background: '#0d0d0f',
  textColor: '#ffffff',
  barCount: 8
});
```

| Option | Default | Description |
|---|---|---|
| `background` | `'#0d0d0f'` | Loader background |
| `textColor` | `'#ffffff'` | Counter text color |
| `fontSize` | `'5rem'` | Counter text size |
| `barCount` | `8` | Number of reveal bars |
| `barColor` | `'#111111'` | Bar color |
| `minStep` / `maxStep` | `1` / `10` | Range for each random count increment |
| `tickDelayMin` / `tickDelayMax` | `40` / `160` | ms range between count updates |
| `barDuration` | `1.2` | Seconds for the bar reveal |
| `onComplete` | `null` | Callback fired after the loader is fully removed |

---

### 14. `Saket.particleNetwork(selector, options)`

A lightweight canvas "connected dots" background — no external particle library, just `<canvas>` + `requestAnimationFrame`. Particles drift and link to nearby neighbors with a line; optionally get pushed away from the cursor.

```html
<div class="hero-bg" style="position: relative; height: 100vh;"></div>
```
```js
Saket.particleNetwork('.hero-bg', {
  particleCount: 80,
  color: '#8a7fff',
  interactive: true
});
```

| Option | Default | Description |
|---|---|---|
| `particleCount` | `80` | Number of particles |
| `color` | `'#8a7fff'` | Particle fill color |
| `linkColor` | `'#8a7fff'` | Line color between nearby particles |
| `linkDistance` | `140` | px — particles closer than this get linked |
| `linkOpacity` | `0.25` | Max opacity of link lines |
| `particleSize` | `2` | Particle radius in px |
| `speed` | `0.4` | Drift speed |
| `interactive` | `true` | Whether particles get pushed away from the cursor |
| `repulseDistance` | `100` | px radius of the cursor's push effect |
| `repulseStrength` | `1.5` | How hard particles get pushed |

The container needs `position: relative` (or similar) and an explicit height — the canvas fills it completely via absolute positioning.

---

### 15. `Saket.clipTitle(selector, options)`

Reveals a title or block by animating its `clip-path` open — starts as a sliver and expands to show the full element.

```js
Saket.clipTitle('.big-title', { shape: 'diamond', duration: 1 });
```

| Option | Default | Description |
|---|---|---|
| `shape` | `'diamond'` | `'diamond'` \| `'rectLeft'` \| `'rectUp'` \| `'circle'` |
| `duration` | `1` | Seconds for the reveal |
| `ease` | `'power3.inOut'` | GSAP easing |
| `trigger` | `'view'` | `'view'` (reveals on scroll into view) \| `'immediate'` |

---

### 16. `Saket.imageSequence(selector, options)`

Cycles an `<img>`'s `src` through a list of images — a hero image that flickers through a sequence, or a hover-scrub product preview.

```js
Saket.imageSequence('.hero-img', {
  images: Array.from({ length: 10 }, (_, i) => `/images/frame-${i + 1}.jpg`),
  interval: 250,
  trigger: 'auto'
});
```

| Option | Default | Description |
|---|---|---|
| `images` | `[]` | Array of image URLs to cycle through — required |
| `interval` | `250` | ms between frames |
| `trigger` | `'auto'` | `'auto'` (always cycling) \| `'hover'` (cycles only while hovered) |
| `loop` | `true` | Whether it loops back to the first image after the last |

---

## Project structure (for local development)

```
saketjs/
├── src/                  # source, edit here
│   ├── index.js
│   ├── effects/
│   └── utils/
├── styles/saketjs.css
├── dist/                 # generated — do not edit by hand
├── demo/                 # live demo pages
└── build.js              # esbuild bundling script
```

---

## Building from source

```bash
npm install
npm run build     # outputs dist/saketjs.esm.js, .cjs.js, .umd.js, .umd.min.js, .css
```

Then open `demo/index.html` directly in a browser to see every effect running.

## Links

- npm: [npmjs.com/package/saketjs](https://www.npmjs.com/package/saketjs)
- GitHub: [github.com/saketsharmacse-droid/SaketJS](https://github.com/saketsharmacse-droid/SaketJS)
- Issues / bugs: [github.com/saketsharmacse-droid/SaketJS/issues](https://github.com/saketsharmacse-droid/SaketJS/issues)

## License

MIT
