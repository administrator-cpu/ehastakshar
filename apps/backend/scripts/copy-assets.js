import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcAssets = path.join(__dirname, '../src/assets');
const distAssets = path.join(__dirname, '../dist/assets');

try {
  if (fs.existsSync(srcAssets)) {
    // On Windows, if the directory already exists and is locked by another process (like PM2 or a scanner),
    // cpSync will fail. So we forcefully remove it first, with retries to outlast temporary file locks.
    if (fs.existsSync(distAssets)) {
      fs.rmSync(distAssets, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
    
    // Copy the fresh assets over
    fs.cpSync(srcAssets, distAssets, { recursive: true });
    console.log('Successfully copied assets to dist/assets');
  } else {
    console.log('No src/assets directory found, skipping copy.');
  }
} catch (error) {
  console.error('Failed to copy assets:', error);
  process.exit(1);
}
