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
  UploadedFile,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const memoryStorage = multer.memoryStorage();

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 15, { storage: memoryStorage }))
  async createAd(
    @Body() dto: CreateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    // Přidej kontrolu počtu obrázků
    if (!files || files.length < 2) {
      throw new BadRequestException('Musíte přidat alespoň dva obrázky.');
    }

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated properly');
    }

    return this.adService.create(dto, req.user.id, files);
  }

  // ✅ Sloučeno filtrování i bez filtrů do jednoho GET
  @Get()
  findAll(@Query() query: any) {
    console.log('📋 AdController.findAll called with query:', JSON.stringify(query));
    // Log příchozích query parametrů pro debugging

    // Normalizuj multi-select filtry
    const multiSelectFields = [
      'fuel',
      'bodyType',
      'transmission',
      'drivetrain',
      'condition',
    ];
    multiSelectFields.forEach((field) => {
      if (query[field] && typeof query[field] === 'string') {
        query[field] = [query[field]];
      }
    });

    // ✅ OPRAVENO - Předej query i do findAll
    if (
      Object.keys(query).filter((key) => !['sortBy', 'sortOrder'].includes(key))
        .length === 0
    ) {
      // Pokud jsou jen sort parametry, použij findAll s query
      console.log('📋 Calling adService.findAll');
      return this.adService.findAll(query);
    }
    return this.adService.findWithFilters(query);
  }

  @Get('test')
  test() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyAds(@Req() req) {
    return this.adService.findByUser(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 15, {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Nepodporovaný formát souboru ${file.originalname}. Povolené formáty: JPEG, PNG, WebP.`,
            ),
            false,
          );
        }
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    try {
      // ✅ OPRAVENO - Proper parsing of imagesToDelete
      let imagesToDelete: string[] = [];

      if (req.body.imagesToDelete) {
        if (typeof req.body.imagesToDelete === 'string') {
          try {
            // Try to parse as JSON first
            imagesToDelete = JSON.parse(req.body.imagesToDelete);
          } catch {
            // If JSON parsing fails, treat as single string
            imagesToDelete = [req.body.imagesToDelete];
          }
        } else if (Array.isArray(req.body.imagesToDelete)) {
          imagesToDelete = req.body.imagesToDelete;
        }
      }

      // ✅ Create clean DTO with properly parsed imagesToDelete
      const cleanDto = {
        ...dto,
        imagesToDelete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      };

      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User not authenticated properly');
      }

      // Check ad ownership
      const existingAd = await this.adService.findOne(id);
      if (existingAd.userId !== req.user.id) {
        throw new UnauthorizedException('Můžete editovat pouze své inzeráty');
      }

      return await this.adService.update(id, cleanDto, req.user.id, files);
    } catch (error) {
      console.error('❌ Update controller error:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Chyba při aktualizaci inzerátu',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated properly');
    }
    return this.adService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 15, { storage: memoryStorage }))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Žádné soubory nebyly přiloženy');
    }

    const uploadedPhotos: any[] = [];

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `ads/${id}/${uuidv4()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new BadRequestException(
          error.message || 'Chyba při uploadu fotek',
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const publicURL = publicUrlData.publicUrl;

      const photo = await this.adService.createPhoto({
        url: publicURL,
        adId: id, // použij přímo id (string)
      });

      uploadedPhotos.push(photo);
    }

    return { photos: uploadedPhotos };
  }

  @Post(':adId/photos')
  async addPhoto(@Param('adId') adId: string, @Body('url') url: string) {
    return this.adService.createPhoto({
      url,
      adId: adId.toString(),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/photos/:photoId')
  async deletePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    await this.adService.deletePhoto(photoId);
    return { ok: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Zvýšit počet zobrazení
    await this.adService.incrementViews(id);

    const ad = await this.adService.findOne(id);

    if (!ad) {
      throw new NotFoundException(`Inzerát s ID ${id} nebyl nalezen`);
    }

    return ad;
  }
}
