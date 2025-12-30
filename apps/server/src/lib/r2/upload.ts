/**
 * R2 Upload Helper Functions
 */

// Generate a unique image token
export function generateImageToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `img_${timestamp}_${random}`;
}

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface UploadResult {
  success: boolean;
  imageToken?: string;
  error?: string;
}

/**
 * Upload an image file to R2
 */
export async function uploadImage(
  r2: R2Bucket,
  file: File
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Generate unique token
  const imageToken = generateImageToken();

  // Get file extension from MIME type
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  const ext = extensions[file.type] || 'jpg';

  // Create the R2 key (path)
  const key = `images/${imageToken}.${ext}`;

  try {
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return {
      success: true,
      imageToken: `${imageToken}.${ext}`,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
}

/**
 * Delete an image from R2
 */
export async function deleteImage(
  r2: R2Bucket,
  imageToken: string
): Promise<boolean> {
  try {
    const key = `images/${imageToken}`;
    await r2.delete(key);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

/**
 * Get the public URL for an image
 * Note: In production, you would use a custom domain or R2 public bucket URL
 */
export function getImageUrl(imageToken: string, baseUrl?: string): string {
  // For local development, serve from /api/images/:token
  // For production, use R2 public bucket URL or custom domain
  if (baseUrl) {
    return `${baseUrl}/images/${imageToken}`;
  }
  return `/api/images/${imageToken}`;
}
