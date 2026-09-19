import { mouseFollower } from './effects/mouseFollower.js';
import { magnet } from './effects/magnet.js';
import { imageHover } from './effects/imageHover.js';
import { textEffect } from './effects/textEffect.js';
import { pageTransition } from './effects/pageTransition.js';
import { smoothScroll } from './effects/smoothScroll.js';
import { parallax } from './effects/parallax.js';
import { marquee } from './effects/marquee.js';
import { ripple } from './effects/ripple.js';
import { preloader } from './effects/preloader.js';
import { string } from './effects/string.js';
import { svgLoader } from './effects/svgLoader.js';
import { counterLoader } from './effects/counterLoader.js';
import { particleNetwork } from './effects/particleNetwork.js';
import { clipTitle } from './effects/clipTitle.js';
import { imageSequence } from './effects/imageSequence.js';

const Saket = {
  mouseFollower,
  magnet,
  imageHover,
  textEffect,
  pageTransition,
  smoothScroll,
  parallax,
  marquee,
  ripple,
  preloader,
  string,
  svgLoader,
  counterLoader,
  particleNetwork,
  clipTitle,
  imageSequence,
  version: '0.5.0'
};

export default Saket;

// Also attach to window when loaded directly via <script> (no bundler),
// e.g. <script src="node_modules/saketjs/dist/saketjs.umd.js"></script>
if (typeof window !== 'undefined') {
  window.Saket = Saket;
}
