import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveAdDto } from './dto/save-ad.dto';
import { SavedAdResponseDto } from './dto/saved-ad-response.dto';
import { publicImageSelect } from '../public-image.select';

@Injectable()
export class SavedAdService {
  constructor(private readonly prisma: PrismaService) {}

  async saveAd(
    userId: string,
    saveAdDto: SaveAdDto,
  ): Promise<SavedAdResponseDto> {
    // Check if ad exists
    const ad = await this.prisma.ad.findUnique({
      where: { id: saveAdDto.adId },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    // Check if already saved
    const existingSavedAd = await this.prisma.savedAd.findUnique({
      where: {
        userId_adId: {
          userId,
          adId: saveAdDto.adId,
        },
      },
    });

    if (existingSavedAd) {
      throw new ConflictException('Ad is already saved');
    }

    // Save the ad
    const savedAd = await this.prisma.savedAd.create({
      data: {
        userId,
        adId: saveAdDto.adId,
      },
      include: {
        ad: {
          include: {
            images: {
              select: publicImageSelect,
            },
          },
        },
      },
    });

    return savedAd;
  }

  async unsaveAd(userId: string, adId: string): Promise<void> {
    const savedAd = await this.prisma.savedAd.findUnique({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });

    if (!savedAd) {
      throw new NotFoundException('Saved ad not found');
    }

    await this.prisma.savedAd.delete({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });
  }

  async getSavedAds(userId: string): Promise<SavedAdResponseDto[]> {
    const savedAds = await this.prisma.savedAd.findMany({
      where: { userId },
      include: {
        ad: {
          include: {
            images: {
              select: publicImageSelect,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return savedAds;
  }

  async isAdSaved(userId: string, adId: string): Promise<boolean> {
    const savedAd = await this.prisma.savedAd.findUnique({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });

    return !!savedAd;
  }
}
