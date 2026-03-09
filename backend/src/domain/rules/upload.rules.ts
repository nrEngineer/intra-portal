const MAX_FILES = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/plain",
  "text/csv",
];

export function validateUpload(body: { fileCount: number; fileSizes: number[] }): string | null {
  if (body.fileCount > MAX_FILES) {
    return `添付ファイルは最大${MAX_FILES}個までです`;
  }
  if (body.fileSizes.some(size => size > MAX_FILE_SIZE)) {
    return "ファイルサイズは10MBまでです";
  }
  return null;
}

export function isAllowedFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

export function isFileTooLarge(size: number): boolean {
  return size > MAX_UPLOAD_SIZE;
}

export { MAX_FILES, MAX_FILE_SIZE, MAX_UPLOAD_SIZE, ALLOWED_TYPES };
