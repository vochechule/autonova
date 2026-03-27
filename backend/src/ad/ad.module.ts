import { Module } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageBlobDatabaseService } from '../image-blob-database.service';
import { ImageStorageService } from '../image-storage.service';
import { ImageController } from '../image.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdController, ImageController],
  providers: [AdService, ImageBlobDatabaseService, ImageStorageService],
  exports: [AdService],
})
export class AdModule {}
