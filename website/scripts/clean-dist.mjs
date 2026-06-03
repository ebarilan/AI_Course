import { rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteRoot = join(scriptDir, '..');

await rm(join(websiteRoot, 'dist'), { recursive: true, force: true });
