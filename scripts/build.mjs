// Minimal build for static site: copy files to dist
import { rm, mkdir, stat, copyFile, readdir } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function emptyDir(dir) {
  if (await exists(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
  await mkdir(dir, { recursive: true });
}

async function copyFileSafe(src, dest) {
  try {
    await copyFile(src, dest);
  } catch (err) {
    if (err && (err.code === 'ENOTSUP' || err.code === 'EXDEV' || err.code === 'EPERM')) {
      await new Promise((resolve, reject) => {
        const rs = createReadStream(src);
        const ws = createWriteStream(dest);
        rs.on('error', reject);
        ws.on('error', reject);
        ws.on('close', resolve);
        rs.pipe(ws);
      });
    } else {
      throw err;
    }
  }
}

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'dist' || entry.name === '.git') continue;
      await copyDir(s, d);
    } else if (entry.isFile()) {
      await copyFileSafe(s, d);
    }
  }
}

export async function build() {
  await emptyDir(dist);
  // Copy root static files
  const staticFiles = ['index.html', 'index.js', 'app.css'];
  for (const f of staticFiles) {
    const src = path.join(root, f);
    if (await exists(src)) {
      await copyFileSafe(src, path.join(dist, f));
    }
  }
  // Copy assets directory if present
  const assets = path.join(root, 'assets');
  if (await exists(assets)) {
    await copyDir(assets, path.join(dist, 'assets'));
  }
  console.log('Build complete:', dist);
}

if (import.meta.main) {
  build().catch((err) => { console.error(err); process.exitCode = 1; });
}
