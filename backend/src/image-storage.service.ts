import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
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

    return this.prisma.image.create({
      data: {
        storageKey,
        url: this.buildPublicUrl(storageKey),
        filename: this.buildFilename(file.originalname),
        mimeType: optimizedImage.mimeType,
        size: optimizedImage.size,
        originalSize: file.size ?? file.buffer.length,
        width: optimizedImage.width,
        height: optimizedImage.height,
        data: optimizedImage.buffer,
        adId,
        order,
      },
      select: publicImageSelect,
    });
  }

  async getImagePayload(storageKey: string) {
    const image = await this.prisma.image.findUnique({
      where: { storageKey },
      select: {
        data: true,
        mimeType: true,
        size: true,
      },
    });

    if (!image || !image.data) {
      throw new NotFoundException('Image not found');
    }

    return {
      buffer: Buffer.from(image.data),
      mimeType: image.mimeType ?? 'image/webp',
      size: image.size ?? image.data.length,
    };
  }

  async cleanupImage(image: { url: string }) {
    if (!LocalStorageService.isLegacyLocalFileUrl(image.url)) {
      return;
    }

    await LocalStorageService.deleteFile(image.url);
  }

  async cleanupImages(images: Array<{ url: string }>) {
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
