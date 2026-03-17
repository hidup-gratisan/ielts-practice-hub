/**
 * Storage Service — Upload/download profile photos to Supabase Storage.
 *
 * Stores photos as files in the 'avatars' bucket and returns public URLs.
 * This replaces storing base64 data URLs in the database (which are huge and can be lost).
 */
import { supabase } from './supabase';

const BUCKET = 'avatars';
const MAX_SIZE = 512; // Max dimension for profile photos

/**
 * Compress and resize a base64 image, then upload to Supabase Storage.
 * Returns the public URL of the uploaded image, or null on failure.
 */
export async function uploadProfilePhoto(userId: string, base64DataUrl: string): Promise<string | null> {
  try {
    // Convert base64 to blob with compression
    const blob = await compressImage(base64DataUrl, MAX_SIZE, 0.8);
    if (!blob) return null;

    const filePath = `${userId}/profile.webp`;

    // Upload (upsert to overwrite existing)
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, blob, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload profile photo error:', error);
      // Fallback: try png
      const pngBlob = await compressImage(base64DataUrl, MAX_SIZE, 0.85, 'image/png');
      if (pngBlob) {
        const pngPath = `${userId}/profile.png`;
        const { error: pngError } = await supabase.storage
          .from(BUCKET)
          .upload(pngPath, pngBlob, {
            contentType: 'image/png',
            upsert: true,
            cacheControl: '3600',
          });
        if (!pngError) {
          return getPublicUrl(pngPath);
        }
      }
      return null;
    }

    return getPublicUrl(filePath);
  } catch (err) {
    console.error('Upload profile photo error:', err);
    return null;
  }
}

/** Get public URL for a storage path */
function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  // Add cache-bust parameter
  return `${data.publicUrl}?t=${Date.now()}`;
}

/** Check if a URL is a base64 data URL (needs migration to storage) */
export function isBase64DataUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith('data:');
}

/** Compress and resize an image via canvas */
async function compressImage(
  base64: string,
  maxDim: number,
  quality: number,
  format: string = 'image/webp',
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Resize to fit within maxDim
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob),
        format,
        quality,
      );
    };
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}
