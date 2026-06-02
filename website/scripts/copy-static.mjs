import { copyFile, cp, mkdir } from 'node:fs/promises';

await mkdir('dist/assets', { recursive: true });
await copyFile('public/index.html', 'dist/index.html');
await copyFile('src/styles.css', 'dist/assets/styles.css');
await cp('../course', 'dist/course', { recursive: true });
