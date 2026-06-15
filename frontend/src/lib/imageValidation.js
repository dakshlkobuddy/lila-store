// Allowed image MIME types and max file size for product photo uploads.
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate an image file before uploading to Supabase Storage.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateImage(file) {
  if (!file) return { valid: false, error: "No file selected." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Only JPG, PNG, and WEBP images are allowed. You selected a "${file.type || "unknown"}" file.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size must be under 5 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    };
  }

  return { valid: true, error: null };
}
