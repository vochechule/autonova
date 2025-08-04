import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('ads')
  async getAllAds() {
    return this.prisma.ad.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, isDealer: true }
        },
        images: true,
        _count: {
          select: { savedBy: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Delete('ads/:id')
  async deleteAd(@Param('id') id: string) {
    // Nejdříve smažeme související záznamy
    await this.prisma.savedAd.deleteMany({
      where: { adId: id }
    });
    
    await this.prisma.image.deleteMany({
      where: { adId: id }
    });

    // Pak smažeme samotný inzerát
    return this.prisma.ad.delete({
      where: { id }
    });
  }

  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDealer: true,
        createdAt: true,
        _count: {
          select: { 
            ads: true,
            savedAds: true,
            reviewsReceived: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('stats')
  async getStats() {
    // Odstranil jsem filtrování podle 'status' které neexistuje
    const [totalUsers, totalAds, totalReviews, visibleAds] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.ad.count(),
      this.prisma.review.count(),
      this.prisma.ad.count({ where: { isVisible: true } }) // Místo 'status' používáme 'isVisible'
    ]);

    return {
      totalUsers,
      totalAds,
      totalReviews,
      visibleAds // Přejmenováno z 'activeAds' na 'visibleAds'
    };
  }
}