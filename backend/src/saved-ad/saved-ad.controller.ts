import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavedAdService } from './saved-ad.service';
import { SaveAdDto } from './dto/save-ad.dto';
import { SavedAdResponseDto } from './dto/saved-ad-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('saved-ads')
@UseGuards(JwtAuthGuard)
export class SavedAdController {
  constructor(private readonly savedAdService: SavedAdService) {}

  @Post()
  async saveAd(
    @Request() req,
    @Body() saveAdDto: SaveAdDto,
  ): Promise<SavedAdResponseDto> {
    return this.savedAdService.saveAd(req.user.id, saveAdDto);
  }

  @Delete(':adId')
  async unsaveAd(@Request() req, @Param('adId') adId: string): Promise<void> {
    return this.savedAdService.unsaveAd(req.user.id, adId);
  }

  @Get()
  async getSavedAds(@Request() req): Promise<SavedAdResponseDto[]> {
    return this.savedAdService.getSavedAds(req.user.id);
  }

  @Get(':adId/is-saved')
  async isAdSaved(
    @Request() req,
    @Param('adId') adId: string,
  ): Promise<{ isSaved: boolean }> {
    const isSaved = await this.savedAdService.isAdSaved(req.user.id, adId);
    return { isSaved };
  }
} 