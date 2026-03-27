import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

type StoredImageBlob = {
  storageKey: string;
  data: Buffer;
  mimeType: string;
  size: number;
};

@Injectable()
export class ImageBlobDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('IMAGE_DATABASE_URL');

    if (!connectionString) {
      throw new Error('IMAGE_DATABASE_URL must be configured');
    }

    this.pool = new Pool({
      connectionString,
    });
  }

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS image_blobs (
        storage_key TEXT PRIMARY KEY,
        data BYTEA NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async storeBlob(blob: StoredImageBlob) {
    await this.pool.query(
      `
        INSERT INTO image_blobs (storage_key, data, mime_type, size)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (storage_key) DO UPDATE
        SET data = EXCLUDED.data,
            mime_type = EXCLUDED.mime_type,
            size = EXCLUDED.size
      `,
      [blob.storageKey, blob.data, blob.mimeType, blob.size],
    );
  }

  async getBlob(storageKey: string) {
    const result = await this.pool.query<{
      data: Buffer;
      mime_type: string;
      size: number;
    }>(
      `
        SELECT data, mime_type, size
        FROM image_blobs
        WHERE storage_key = $1
      `,
      [storageKey],
    );

    return result.rows[0] ?? null;
  }

  async deleteBlob(storageKey: string) {
    await this.pool.query(
      `
        DELETE FROM image_blobs
        WHERE storage_key = $1
      `,
      [storageKey],
    );
  }
}
