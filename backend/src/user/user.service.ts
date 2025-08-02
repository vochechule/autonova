import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu dle projektu

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, name: string) {
    return this.prisma.user.create({ data: { email, password, name } });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getSavedAdsCount(userId: string): Promise<number> {
    return this.prisma.savedAd.count({
      where: { userId },
    });
  }

  async upsertReview(raterId: string, targetId: string, rating: number, comment?: string) {
    // Only allow rating if target has posted at least one ad
    const adCount = await this.prisma.ad.count({ where: { userId: targetId } });
    if (adCount === 0) {
      throw new Error('User has not posted any ads and cannot be rated.');
    }
    return this.prisma.review.upsert({
      where: { userId_targetId: { userId: raterId, targetId } },
      update: { rating, comment },
      create: { rating, comment, userId: raterId, targetId },
    });
  }

  async getReviewsForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { targetId: userId },
      include: { user: { select: { id: true, name: true } } }, // reviewer info
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageRatingForUser(userId: string): Promise<number | null> {
    const result = await this.prisma.review.aggregate({
      where: { targetId: userId },
      _avg: { rating: true },
    });
    return result._avg.rating;
  }

  async hasPostedAd(userId: string): Promise<boolean> {
    const count = await this.prisma.ad.count({ where: { userId } });
    return count > 0;
  }
}
