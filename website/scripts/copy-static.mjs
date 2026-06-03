import { copyFile, cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteRoot = join(scriptDir, '..');
const repoRoot = join(websiteRoot, '..');
const distRoot = join(websiteRoot, 'dist');

await mkdir(join(distRoot, 'assets'), { recursive: true });
await copyFile(join(websiteRoot, 'public', 'index.html'), join(distRoot, 'index.html'));
await copyFile(join(websiteRoot, 'src', 'styles.css'), join(distRoot, 'assets', 'styles.css'));
await cp(join(repoRoot, 'course'), join(distRoot, 'course'), { recursive: true });
