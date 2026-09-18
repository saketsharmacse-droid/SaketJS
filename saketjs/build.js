const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watch = process.argv.includes('--watch');
const outDir = path.join(__dirname, 'dist');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// GSAP is bundled directly into every output format. That means a
// consumer only ever needs ONE import/script tag — they never have to
// separately install or <script> GSAP themselves.
const commonOptions = {
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true,
  sourcemap: true,
  logLevel: 'info'
};

const targets = [
  {
    ...commonOptions,
    format: 'esm',
    outfile: path.join(outDir, 'saketjs.esm.js')
  },
  {
    ...commonOptions,
    format: 'cjs',
    outfile: path.join(outDir, 'saketjs.cjs.js')
  },
  {
    ...commonOptions,
    format: 'iife',
    globalName: 'SaketBundle',
    outfile: path.join(outDir, 'saketjs.umd.js')
  },
  {
    ...commonOptions,
    format: 'iife',
    globalName: 'SaketBundle',
    outfile: path.join(outDir, 'saketjs.umd.min.js'),
    minify: true,
    sourcemap: false
  }
];

async function run() {
  for (const target of targets) {
    if (watch) {
      const ctx = await esbuild.context(target);
      await ctx.watch();
    } else {
      await esbuild.build(target);
    }
  }

  // Copy the CSS as-is into dist/ so "saketjs/dist/saketjs.css" resolves.
  fs.copyFileSync(
    path.join(__dirname, 'styles/saketjs.css'),
    path.join(outDir, 'saketjs.css')
  );

  console.log('\nSaketJS build complete -> dist/');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
