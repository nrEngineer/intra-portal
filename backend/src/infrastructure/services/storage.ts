import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export interface StorageProvider {
  upload(file: Buffer, filename: string, contentType: string): Promise<{ key: string; url: string }>;
  getSignedUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// Cloudflare R2 ストレージ
export class R2Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || "";
    this.bucket = process.env.R2_BUCKET_NAME || "intra-portal";
    this.publicUrl = process.env.R2_PUBLIC_URL || "";

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<{ key: string; url: string }> {
    const ext = filename.split(".").pop() || "";
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }));

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;
    return { key, url };
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}

// ローカルストレージ（開発用・テスト用）
export class LocalStorage implements StorageProvider {
  private files = new Map<string, { buffer: Buffer; contentType: string }>();

  async upload(file: Buffer, filename: string, contentType: string): Promise<{ key: string; url: string }> {
    const ext = filename.split(".").pop() || "";
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    this.files.set(key, { buffer: file, contentType });
    return { key, url: `/files/${key}` };
  }

  async getSignedUrl(key: string): Promise<string> {
    return `/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    this.files.delete(key);
  }
}

// 環境変数でプロバイダーを切り替え
export function createStorage(): StorageProvider {
  if (process.env.R2_ACCOUNT_ID) {
    return new R2Storage();
  }
  return new LocalStorage();
}

export const storage = createStorage();
