import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcAssets = path.join(__dirname, '../src/assets');
const distAssets = path.join(__dirname, '../dist/assets');

try {
  if (fs.existsSync(srcAssets)) {
    fs.cpSync(srcAssets, distAssets, { recursive: true });
    console.log('Successfully copied assets to dist/assets');
  } else {
    console.log('No src/assets directory found, skipping copy.');
  }
} catch (error) {
  console.error('Failed to copy assets:', error);
  process.exit(1);
}
