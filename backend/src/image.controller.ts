import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ImageStorageService } from './image-storage.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  @Get(':storageKey')
  async getImage(
    @Param('storageKey') storageKey: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const image = await this.imageStorageService.getImagePayload(storageKey);

    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Content-Length', image.size.toString());
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return new StreamableFile(image.buffer);
  }
}
