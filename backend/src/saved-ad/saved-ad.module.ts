import { Module } from '@nestjs/common';
import { SavedAdController } from './saved-ad.controller';
import { SavedAdService } from './saved-ad.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedAdController],
  providers: [SavedAdService],
  exports: [SavedAdService],
})
export class SavedAdModule {} 