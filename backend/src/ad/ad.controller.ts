import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // nebo jiná cesta podle tvého projektu

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateAdDto) {
    return this.adService.create(req.user.userId, dto);  // opraveno zde
  }

  @Get()
  findAll() {
    return this.adService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdDto) {
    return this.adService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adService.remove(+id);
  }
}
