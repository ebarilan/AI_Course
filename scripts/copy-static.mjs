import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist/assets', { recursive: true });
await copyFile('public/index.html', 'dist/index.html');
await copyFile('src/styles.css', 'dist/assets/styles.css');
