/**
 * 🚀 UniCoach Image Optimization Script
 * 
 * Converts all PNG/JPG images in src/assets and public/images to WebP format
 * with aggressive compression. Reduces total image payload by ~90%.
 * 
 * Run: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Directories to scan for large images
const DIRS_TO_OPTIMIZE = [
  join(ROOT, 'src', 'assets'),
  join(ROOT, 'src', 'assets', 'destinations'),
  join(ROOT, 'public', 'images'),
  join(ROOT, 'public'),
];

// Image extensions to convert
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg'];

// Max dimensions for different image types
const SIZE_CONFIGS = {
  // Hero / CTA background images — max 1200px wide
  hero: { width: 1200, quality: 78 },
  // Destination card images — max 800px wide  
  card: { width: 800, quality: 75 },
  // Thumbnails / small assets — max 400px wide
  small: { width: 400, quality: 72 },
  // Default
  default: { width: 1000, quality: 76 },
};

function getConfig(filePath, originalSize) {
  const name = basename(filePath).toLowerCase();
  
  // Hero images (>1MB usually hero/bg)
  if (name.includes('hero') || name.includes('cta_bg') || name.includes('image.png')) {
    return SIZE_CONFIGS.hero;
  }
  // Destination images  
  if (name.includes('usa') || name.includes('uk') || name.includes('canada') || 
      name.includes('australia') || name.includes('germany') || name.includes('ireland') ||
      name.includes('story_step') || name.includes('counselor')) {
    return SIZE_CONFIGS.card;
  }
  // Small assets (< 100KB original)
  if (originalSize < 100_000) {
    return SIZE_CONFIGS.small;
  }
  return SIZE_CONFIGS.default;
}

async function findImages(dir) {
  const results = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isFile() && IMAGE_EXTS.includes(extname(entry.name).toLowerCase())) {
        const fileStat = await stat(fullPath);
        // Only optimize files > 50KB (skip tiny icons)
        if (fileStat.size > 50_000) {
          results.push({ path: fullPath, size: fileStat.size });
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist, skip
  }
  return results;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function optimizeImage(filePath, originalSize) {
  const config = getConfig(filePath, originalSize);
  const ext = extname(filePath);
  const webpPath = filePath.replace(ext, '.webp');
  const relPath = relative(ROOT, filePath);
  
  try {
    await sharp(filePath)
      .resize({ width: config.width, withoutEnlargement: true })
      .webp({ quality: config.quality, effort: 6 })
      .toFile(webpPath);
    
    const newStat = await stat(webpPath);
    const savings = ((1 - newStat.size / originalSize) * 100).toFixed(1);
    
    console.log(`  ✅ ${relPath}`);
    console.log(`     ${formatBytes(originalSize)} → ${formatBytes(newStat.size)} (${savings}% smaller)`);
    
    return { original: originalSize, optimized: newStat.size, file: relPath };
  } catch (e) {
    console.log(`  ❌ ${relPath}: ${e.message}`);
    return { original: originalSize, optimized: originalSize, file: relPath, error: true };
  }
}

async function main() {
  console.log('\n🖼️  UniCoach Image Optimizer');
  console.log('═'.repeat(50));
  
  let allImages = [];
  for (const dir of DIRS_TO_OPTIMIZE) {
    const images = await findImages(dir);
    allImages = allImages.concat(images);
  }
  
  // De-duplicate by path
  const seen = new Set();
  allImages = allImages.filter(img => {
    if (seen.has(img.path)) return false;
    seen.add(img.path);
    return true;
  });
  
  console.log(`\n📁 Found ${allImages.length} images to optimize\n`);
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const img of allImages) {
    const result = await optimizeImage(img.path, img.size);
    totalOriginal += result.original;
    totalOptimized += result.optimized;
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 RESULTS:`);
  console.log(`   Total Before: ${formatBytes(totalOriginal)}`);
  console.log(`   Total After:  ${formatBytes(totalOptimized)}`);
  console.log(`   Savings:      ${formatBytes(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`\n💡 Next: Update imports in components to use .webp files\n`);
}

main().catch(console.error);
