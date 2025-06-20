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
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const memoryStorage = multer.memoryStorage();

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateAdDto) {
    return this.adService.create(req.user.userId, dto);
  }

  // ✅ Sloučeno filtrování i bez filtrů do jednoho GET
  @Get()
  findAll(@Query() query: any) {
    if (Object.keys(query).length === 0) {
      return this.adService.findAll();
    }
    return this.adService.findWithFilters(query);
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10, { storage: memoryStorage }))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Žádné soubory nebyly přiloženy');
    }

    const adId = Number(id);
    if (isNaN(adId)) {
      throw new BadRequestException('Neplatné ID inzerátu');
    }

    const uploadedPhotos: any[] = [];

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `ads/${adId}/${uuidv4()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new BadRequestException(error.message || 'Chyba při uploadu fotek');
      }

      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const publicURL = publicUrlData.publicUrl;

      const photo = await this.adService.createPhoto({
        url: publicURL,
        adId: adId,
      });

      uploadedPhotos.push(photo);
    }

    return { photos: uploadedPhotos };
  }
}
