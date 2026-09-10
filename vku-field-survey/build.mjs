import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = join(projectRoot, 'dist');
const webFiles = [
  'index.html',
  'style.css',
  'main.js',
  'db.js',
  'manifest.json',
  'sw.js'
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of webFiles) {
  await cp(join(projectRoot, file), join(outputDir, file));
}

await build({
  entryPoints: [join(projectRoot, 'native-entry.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2017',
  outfile: join(outputDir, 'native-plugins.js'),
  sourcemap: false,
  minify: true
});

await cp(join(projectRoot, 'icons'), join(outputDir, 'icons'), { recursive: true });