import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { ImageBlobDatabaseService } from './image-blob-database.service';
import { publicImageSelect } from './public-image.select';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class ImageStorageService {
  private readonly maxWidth = 1920;
  private readonly maxHeight = 1920;
  private readonly webpQuality = 82;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly imageBlobDatabaseService: ImageBlobDatabaseService,
  ) {}

  async storeImages(
    files: Express.Multer.File[],
    adId: string,
    startOrder = 0,
  ) {
    const createdImages: Array<
      Awaited<ReturnType<ImageStorageService['storeImage']>>
    > = [];

    for (let index = 0; index < files.length; index++) {
      createdImages.push(
        await this.storeImage(files[index], adId, startOrder + index),
      );
    }

    return createdImages;
  }

  async storeImage(file: Express.Multer.File, adId: string, order = 0) {
    const storageKey = randomUUID();
    const optimizedImage = await this.optimizeImage(file);

    await this.imageBlobDatabaseService.storeBlob({
      storageKey,
      data: optimizedImage.buffer,
      mimeType: optimizedImage.mimeType,
      size: optimizedImage.size,
    });

    try {
      return await this.prisma.image.create({
        data: {
          storageKey,
          url: this.buildPublicUrl(storageKey),
          filename: this.buildFilename(file.originalname),
          mimeType: optimizedImage.mimeType,
          size: optimizedImage.size,
          originalSize: file.size ?? file.buffer.length,
          width: optimizedImage.width,
          height: optimizedImage.height,
          adId,
          order,
        },
        select: publicImageSelect,
      });
    } catch (error) {
      await this.imageBlobDatabaseService.deleteBlob(storageKey);
      throw error;
    }
  }

  async getImagePayload(storageKey: string) {
    const image = await this.imageBlobDatabaseService.getBlob(storageKey);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return {
      buffer: Buffer.from(image.data),
      mimeType: image.mime_type,
      size: image.size,
    };
  }

  async cleanupImage(image: { url: string; storageKey?: string | null }) {
    if (image.storageKey) {
      await this.imageBlobDatabaseService.deleteBlob(image.storageKey);
    }

    if (!LocalStorageService.isLegacyLocalFileUrl(image.url)) {
      return;
    }

    await LocalStorageService.deleteFile(image.url);
  }

  async cleanupImages(
    images: Array<{ url: string; storageKey?: string | null }>,
  ) {
    for (const image of images) {
      if (image.storageKey) {
        await this.imageBlobDatabaseService.deleteBlob(image.storageKey);
      }
    }

    const legacyUrls = images
      .map((image) => image.url)
      .filter((url) => LocalStorageService.isLegacyLocalFileUrl(url));

    if (legacyUrls.length === 0) {
      return;
    }

    await LocalStorageService.deleteFiles(legacyUrls);
  }

  private async optimizeImage(file: Express.Multer.File) {
    const metadata = await sharp(file.buffer).metadata();
    const optimizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({
        width: this.maxWidth,
        height: this.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: this.webpQuality,
        effort: 4,
      })
      .toBuffer();

    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      size: optimizedBuffer.length,
      width: optimizedMetadata.width ?? metadata.width ?? null,
      height: optimizedMetadata.height ?? metadata.height ?? null,
    };
  }

  private buildPublicUrl(storageKey: string) {
    const apiUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL');

    if (apiUrl?.replace(/\/+$/, '').endsWith('/api')) {
      return `/api/images/${storageKey}`;
    }

    return `/images/${storageKey}`;
  }

  private buildFilename(originalName: string | undefined) {
    const extension = path.extname(originalName || '');
    const baseName = path
      .basename(originalName || `image${extension}`, extension)
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return `${baseName || 'image'}.webp`;
  }
}
