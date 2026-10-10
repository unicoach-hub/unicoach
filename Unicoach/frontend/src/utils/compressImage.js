// Shrinks a photo in the browser before upload (max 1600px, WebP ~80%), so scans and phone photos
// go from several MB to a few hundred KB. PDFs and small images are returned unchanged.
const MAX_SIDE = 1600;
const SKIP_UNDER = 300 * 1024;

export default async function compressImage(file) {
  if (!file?.type?.startsWith('image/') || file.size < SKIP_UNDER) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file; // unsupported image: upload as is
  }
}
