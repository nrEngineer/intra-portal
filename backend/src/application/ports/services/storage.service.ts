export interface StorageService {
  upload(buffer: Buffer, filename: string, contentType: string): Promise<{ key: string; url: string }>;
  delete(key: string): Promise<void>;
}
