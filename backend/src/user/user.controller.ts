import { Controller, Get, UseGuards, Req, Body, Param, Post, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user; // data z tokenu (userId, email)
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-ads-count')
  async getSavedAdsCount(@Req() req) {
    const count = await this.userService.getSavedAdsCount(req.user.id);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/review')
  async upsertReview(@Req() req, @Param('id') targetId: string, @Body() body: { rating: number; comment?: string }) {
    const raterId = req.user.id;
    if (raterId === targetId) {
      throw new BadRequestException('You cannot rate yourself.');
    }
    try {
      return await this.userService.upsertReview(raterId, targetId, body.rating, body.comment);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') userId: string) {
    return this.userService.getReviewsForUser(userId);
  }

  @Get(':id/average-rating')
  async getAverageRating(@Param('id') userId: string) {
    const avg = await this.userService.getAverageRatingForUser(userId);
    return { averageRating: avg };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    Logger.log(`GET /user/${id}`);
    const user = await this.userService.findOne(id);
    if (!user) {
      Logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }
    
    // ✅ OPRAVENO - Vraťte celého uživatele včetně inzerátů
    Logger.log(`User found: ${user.id}, ads count: ${user.ads?.length || 0}`);
    return user; // Vrátit celý objekt místo jen vybraných polí
  }
}
