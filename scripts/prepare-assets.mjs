import fs from 'node:fs/promises';
import sharp from 'sharp';

await fs.mkdir('public/assets', { recursive: true });
for (const width of [480, 768, 1122]) {
  await sharp('image.png').resize({ width, withoutEnlargement: true })
    .webp({ quality: 87 }).toFile(`public/assets/ammar-${width}.webp`);
}
