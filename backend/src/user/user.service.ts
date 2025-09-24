import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu dle projektu

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userData: any) {
    return this.prisma.user.create({ 
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        isDealer: true,
        dealerTier: true,
        role: true,
        createdAt: true,
        // Don't return password
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ads: {
          include: {
            images: {
              take: 1 // Jen první obrázek pro náhled
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    });

    if (!user) {
      throw new NotFoundException(`Uživatel s ID ${id} nebyl nalezen`);
    }

    return user;
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

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
  }

  async updateProfile(userId: string, name: string, email: string) {
    // Check if email is already taken by another user
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error('Email is already taken by another user');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        isDealer: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password before deletion
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password is incorrect');
    }

    // Delete user and all related data (Prisma will handle cascading)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }

  async getUserAdLimits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isDealer: true, dealerTier: true }
    });

    if (!user) {
      throw new NotFoundException('Uživatel nenalezen');
    }

    const currentAdsCount = await this.prisma.ad.count({
      where: { userId }
    });

    // Soukromí uživatelé - 10 inzerátů
    if (!user.isDealer) {
      return {
        maxAds: 10,
        currentAds: currentAdsCount,
        remainingAds: Math.max(0, 10 - currentAdsCount),
        tier: 'PRIVATE',
        isDealer: false
      };
    }

    // Dealer tier limity
    const tierLimits = {
      BASIC: 25,
      PREMIUM: 75,
      ENTERPRISE: 150
    };

    const maxAds = tierLimits[user.dealerTier] || 25;

    return {
      maxAds,
      currentAds: currentAdsCount,
      remainingAds: Math.max(0, maxAds - currentAdsCount),
      tier: user.dealerTier,
      isDealer: true
    };
  }

  // ✅ ADMIN - Upgrade/downgrade dealer tier
  async updateDealerTier(userId: string, newTier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Uživatel nenalezen');
    }

    if (!user.isDealer) {
      throw new BadRequestException('Pouze autobazary mohou mít tier');
    }

    const validTiers = ['BASIC', 'PREMIUM', 'ENTERPRISE'];
    if (!validTiers.includes(newTier)) {
      throw new BadRequestException('Neplatný tier');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        dealerTier: newTier,
        tierUpgradedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        isDealer: true,
        dealerTier: true,
        tierUpgradedAt: true
      }
    });
  }
}
