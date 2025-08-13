import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdService {
  private supabase;

  constructor(private prisma: PrismaService) {
    // Inicializace Supabase klienta
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log pro kontrolu inicializace
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Supabase initialized:', !!this.supabase);
  }

  async create(dto: any, userId: string, files?: Express.Multer.File[]) {
    // Kontrola userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // ✅ PŘIDÁNO - Validace obrázků
    if (!files || files.length < 2) {
      throw new Error('Je nutné nahrát alespoň 2 obrázky');
    }

    // ✅ PŘIDÁNO - Validace povinných polí
    const requiredFields = ['title', 'brand', 'model', 'price', 'mileage', 'year', 'firstRegistration', 
                         'bodyType', 'color', 'colorFinish', 'doorCount', 'seatCount', 
                         'fuel', 'engineVolume', 'power', 'avgConsumption', 'transmission', 
                         'drivetrain', 'condition', 'countryOfOrigin'];

    const missingFields = requiredFields.filter(field => !dto[field] || dto[field] === '');
    if (missingFields.length > 0) {
      throw new Error(`Chybí povinná pole: ${missingFields.join(', ')}`);
    }

    // Odstraň features ze základních dat, zpracuji je zvlášť
    const { features, ...adBaseData } = dto;
    
    // Převeď stringy na správné typy
    const data = {
      ...adBaseData,
      // Numerické hodnoty
      price: dto.price ? Number(dto.price) : undefined,
      mileage: dto.mileage ? Number(dto.mileage) : undefined, 
      year: dto.year ? Number(dto.year) : undefined,
      firstRegistration: dto.firstRegistration ? Number(dto.firstRegistration) : undefined,
      doorCount: dto.doorCount ? Number(dto.doorCount) : undefined,
      seatCount: dto.seatCount ? Number(dto.seatCount) : undefined,
      airbagCount: dto.airbagCount ? Number(dto.airbagCount) : undefined,
      engineVolume: dto.engineVolume ? Number(dto.engineVolume) : undefined,
      power: dto.power ? Number(dto.power) : undefined,
      avgConsumption: dto.avgConsumption ? Number(dto.avgConsumption) : undefined,
      gearCount: dto.gearCount ? Number(dto.gearCount) : undefined,
      
      // Boolean hodnoty
      ecoTaxPaid: dto.ecoTaxPaid === 'on' || dto.ecoTaxPaid === 'true' || dto.ecoTaxPaid === true,
      isFirstOwner: dto.isFirstOwner === 'on' || dto.isFirstOwner === 'true' || dto.isFirstOwner === true,
      isDisabledAdapted: dto.isDisabledAdapted === 'on' || dto.isDisabledAdapted === 'true' || dto.isDisabledAdapted === true,
      wasCrashed: dto.wasCrashed === 'on' || dto.wasCrashed === 'true' || dto.wasCrashed === true,
      hasServiceBook: dto.hasServiceBook === 'on' || dto.hasServiceBook === 'true' || dto.hasServiceBook === true,
      
      // Datumy
      technicalCheckUntil: dto.technicalCheckUntil ? new Date(dto.technicalCheckUntil).toISOString() : undefined,
      warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil).toISOString() : undefined,
      
      // ✅ OPRAVENO - Nepovinné string hodnoty
      airConditioning: dto.airConditioning || undefined,
      euroStandard: dto.euroStandard || undefined,
      description: dto.description || undefined,
      
      // Místo userId použij user.connect
      user: {
        connect: { id: userId }
      }
    };

    // ✅ PŘIDÁNO - Odstraň undefined hodnoty
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === '') {
        delete data[key];
      }
    });

    // Vytvořit inzerát
    const ad = await this.prisma.ad.create({
      data,
      include: { images: true, user: true, features: true },
    });
    
    // Zpracovat obrázky
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // ✅ PŘIDÁNO - Validace velikosti souboru (10MB limit)
          const maxSize = 10 * 1024 * 1024; // 10MB v bytech
          if (file.size > maxSize) {
            throw new BadRequestException(`Soubor ${file.originalname} je příliš velký. Maximální velikost je 10MB, váš soubor má ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
          }

          // ✅ PŘIDÁNO - Validace typu souboru
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Nepodporovaný formát souboru ${file.originalname}. Povolené formáty: JPEG, PNG, WebP.`);
          }

          // ✅ ZMĚNĚNO - Jednoduchý a bezpečný název
          const fileExtension = path.extname(file.originalname || '.jpg');
          const filename = `ad_${Date.now()}_${i + 1}${fileExtension}`;
          
          console.log('🔥 Original filename:', file.originalname);
          console.log('🔥 Safe filename:', filename);
          console.log('🔥 File size:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
          console.log('🔥 File type:', file.mimetype);
          
          const { data, error } = await this.supabase
            .storage
            .from('photos')
            .upload(filename, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          if (error) {
            console.error('❌ Supabase upload error:', error);
            throw new BadRequestException(`Upload failed: ${error.message}`);
          }

          console.log('✅ Upload successful:', data);

          const { data: urlData } = this.supabase
            .storage
            .from('photos')
            .getPublicUrl(filename);

          console.log('🔗 Generated URL:', urlData?.publicUrl);

          await this.prisma.image.create({
            data: {
              url: urlData?.publicUrl || `https://lfmfxfazzkpvojhhmnhv.supabase.co/storage/v1/object/public/photos/${filename}`,
              adId: ad.id,
            },
          });
        } catch (err) {
          console.error('❌ File upload error:', err);
          // ✅ ZMĚNĚNO - Properly throw the error
          if (err instanceof BadRequestException) {
            throw err; // Re-throw validation errors
          }
          throw new BadRequestException(`Chyba při nahrávání souboru ${file.originalname}: ${err.message}`);
        }
      }
    } else {
      // Defaultní obrázek
      await this.prisma.image.create({
        data: {
          url: 'https://via.placeholder.com/800x600?text=No+Image+Available',
          adId: ad.id,
        },
      });
    }
    
    // Vrátit inzerát s obrázky
    return this.prisma.ad.findUnique({
      where: { id: ad.id },
      include: { images: true, user: true, features: true },
    });
  }

  async findWithFilters(query: any) {
    // ✅ PŘIDEJTE PAGINATION PARAMETRY
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      title,
      brand,
      model,
      priceFrom,
      priceTo,
      mileage,
      mileageFrom,
      mileageTo,
      yearFrom,
      yearTo,
      fuel,
      bodyType,
      color,
      colorFinish, // ✅ PŘIDÁNO
      powerFrom,
      powerTo,
      transmission,
      drivetrain,
      doorCount,
      seatCount,
      condition,
    } = query;

    const where: any = {
      title: title ? { contains: title, mode: 'insensitive' } : undefined,
      brand: brand ? { contains: brand, mode: 'insensitive' } : undefined,
      model: model ? { contains: model, mode: 'insensitive' } : undefined,
      price: {
        gte: priceFrom ? Number(priceFrom) : undefined,
        lte: priceTo ? Number(priceTo) : undefined,
      },
      mileage: {
        gte: mileageFrom ? Number(mileageFrom) : (mileage ? undefined : undefined),
        lte: mileageTo ? Number(mileageTo) : (mileage ? Number(mileage) : undefined),
      },
      year: {
        gte: yearFrom ? Number(yearFrom) : undefined,
        lte: yearTo ? Number(yearTo) : undefined,
      },
      power: {
        gte: powerFrom ? Number(powerFrom) : undefined,
        lte: powerTo ? Number(powerTo) : undefined,
      },
      doorCount: doorCount ? Number(doorCount) : undefined,
      seatCount: seatCount ? Number(seatCount) : undefined,
    };

    // Helper funkce pro zpracování multi-select filtrů
    const addMultiSelectFilter = (field: string, values: string | string[]) => {
      if (!values) return;
      
      let valuesArray: string[];
      
      // Pokud už je to pole, použij ho přímo
      if (Array.isArray(values)) {
        valuesArray = values.filter(v => v && v.trim()); // Remove empty values
      } else if (typeof values === 'string') {
        // Pokud je to string, může to být buď jednotlivá hodnota nebo JSON array
        try {
          const parsed = JSON.parse(values);
          valuesArray = Array.isArray(parsed) ? parsed : [values];
        } catch {
          // Není to JSON, tak je to prostě string - rozdělíme čárkami pro jistotu
          valuesArray = values.split(',').map(v => v.trim()).filter(v => v);
        }
      } else {
        return; // Neznámý typ
      }
      
      if (valuesArray.length > 0) {
        where[field] = { in: valuesArray };
      }
    };

    // Aplikuj multi-select filtry
    addMultiSelectFilter('fuel', fuel);
    addMultiSelectFilter('bodyType', bodyType);
    addMultiSelectFilter('transmission', transmission);
    addMultiSelectFilter('drivetrain', drivetrain);
    addMultiSelectFilter('condition', condition);

    // Jednoduchý filtr pro barvu (zatím zůstává single-select)
    if (color) {
      where.color = color;
    }

    // ✅ PŘIDÁNO - Filtr pro povrchovou úpravu barvy
    if (colorFinish) {
      where.colorFinish = colorFinish;
    }

    // Přidej fulltextové vyhledávání
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: model, mode: 'insensitive' } },
      ];
    }

    // Odstraň undefined hodnoty
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    console.log('Filter where clause:', JSON.stringify(where, null, 2));

    // ✅ PŘIDEJTE PAGINATION A COUNT
    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { images: true, user: true, features: true },
        skip,      // ← PAGINATION
        take: limit // ← LIMIT
      }),
      this.prisma.ad.count({ where }) // ← TOTAL COUNT
    ]);

    // Attach average rating to each ad's user
    for (const ad of ads) {
      const avg = await this.prisma.review.aggregate({
        where: { targetId: ad.userId },
        _avg: { rating: true },
      });
      (ad.user as any).averageRating = avg._avg.rating;
    }

    // ✅ VRAŤ PAGINATION DATA
    return {
      ads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  findAll = async () => {
    const ads = await this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, images: true, features: true },
    });
    for (const ad of ads) {
      const avg = await this.prisma.review.aggregate({
        where: { targetId: ad.userId },
        _avg: { rating: true },
      });
      (ad.user as any).averageRating = avg._avg.rating;
    }
    return ads;
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await this.prisma.ad.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        }
      });
    } catch (error) {
      // Pokud inzerát neexistuje, nebude se počítadlo zvyšovat
      console.error('Error incrementing views:', error);
    }
  }

  async findOne(id: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { 
        images: true, 
        user: true, 
        features: true 
      },
    });
    
    if (!ad) {
      throw new NotFoundException(`Inzerát s ID ${id} nebyl nalezen`);
    }
    
    // Pokud inzerát nemá žádné obrázky, přidej defaultní
    if (!ad.images || ad.images.length === 0) {
      const defaultImage = await this.prisma.image.create({
        data: {
          url: 'https://via.placeholder.com/800x600?text=No+Image+Available',
          adId: ad.id,
        },
      });
      
      ad.images = [defaultImage];
    }
    
    // Attach average rating to user
    const avg = await this.prisma.review.aggregate({
      where: { targetId: ad.userId },
      _avg: { rating: true },
    });
    (ad.user as any).averageRating = avg._avg.rating;
    return ad;
  }

  async update(id: string, dto: any, userId: string, files?: Express.Multer.File[]) {
    // Kontrola vlastnictví
    const existingAd = await this.prisma.ad.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!existingAd) {
      throw new NotFoundException(`Inzerát s ID ${id} nebyl nalezen`);
    }

    if (existingAd.userId !== userId) {
      throw new BadRequestException('Můžete editovat pouze své inzeráty');
    }

    // Validace povinných polí (stejná jako při vytváření)
    const requiredFields = ['title', 'brand', 'model', 'price', 'mileage', 'year', 'firstRegistration', 
                         'bodyType', 'color', 'colorFinish', 'doorCount', 'seatCount', 
                         'fuel', 'engineVolume', 'power', 'avgConsumption', 'transmission', 
                         'drivetrain', 'condition', 'countryOfOrigin'];

    const missingFields = requiredFields.filter(field => !dto[field] || dto[field] === '');
    if (missingFields.length > 0) {
      throw new Error(`Chybí povinná pole: ${missingFields.join(', ')}`);
    }

    // Odstraň features ze základních dat
    const { features, imagesToDelete, ...adBaseData } = dto;
    
    // Převeď stringy na správné typy (stejná logika jako v create)
    const data = {
      ...adBaseData,
      // Numerické hodnoty
      price: dto.price ? Number(dto.price) : undefined,
      mileage: dto.mileage ? Number(dto.mileage) : undefined,
      year: dto.year ? Number(dto.year) : undefined,
      firstRegistration: dto.firstRegistration ? Number(dto.firstRegistration) : undefined,
      doorCount: dto.doorCount ? Number(dto.doorCount) : undefined,
      seatCount: dto.seatCount ? Number(dto.seatCount) : undefined,
      airbagCount: dto.airbagCount ? Number(dto.airbagCount) : undefined,
      engineVolume: dto.engineVolume ? Number(dto.engineVolume) : undefined,
      power: dto.power ? Number(dto.power) : undefined,
      avgConsumption: dto.avgConsumption ? Number(dto.avgConsumption) : undefined,
      gearCount: dto.gearCount ? Number(dto.gearCount) : undefined,
      
      // Boolean hodnoty
      ecoTaxPaid: dto.ecoTaxPaid === 'on' || dto.ecoTaxPaid === 'true' || dto.ecoTaxPaid === true,
      isFirstOwner: dto.isFirstOwner === 'on' || dto.isFirstOwner === 'true' || dto.isFirstOwner === true,
      isDisabledAdapted: dto.isDisabledAdapted === 'on' || dto.isDisabledAdapted === 'true' || dto.isDisabledAdapted === true,
      wasCrashed: dto.wasCrashed === 'on' || dto.wasCrashed === 'true' || dto.wasCrashed === true,
      hasServiceBook: dto.hasServiceBook === 'on' || dto.hasServiceBook === 'true' || dto.hasServiceBook === true,
      
      // Datumy
      technicalCheckUntil: dto.technicalCheckUntil ? new Date(dto.technicalCheckUntil).toISOString() : undefined,
      warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil).toISOString() : undefined,
      
      // Nepovinné string hodnoty
      airConditioning: dto.airConditioning || undefined,
      euroStandard: dto.euroStandard || undefined,
      description: dto.description || undefined,
    };

    // Odstraň undefined hodnoty
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === '') {
        delete data[key];
      }
    });

    // Aktualizuj základní data inzerátu
    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data,
      include: { images: true, user: true, features: true },
    });

    // Zpracuj obrázky pokud jsou přiloženy
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Validace velikosti a typu (stejná jako v create)
          const maxSize = 10 * 1024 * 1024;
          if (file.size > maxSize) {
            throw new BadRequestException(`Soubor ${file.originalname} je příliš velký. Maximální velikost je 10MB.`);
          }

          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Nepodporovaný formát souboru ${file.originalname}.`);
          }

          // Upload do Supabase
          const fileExtension = path.extname(file.originalname || '.jpg');
          const filename = `ad_${Date.now()}_edit_${i + 1}${fileExtension}`;
          
          const { data: uploadData, error } = await this.supabase
            .storage
            .from('photos')
            .upload(filename, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          if (error) {
            throw new BadRequestException(`Upload failed: ${error.message}`);
          }

          const { data: urlData } = this.supabase
            .storage
            .from('photos')
            .getPublicUrl(filename);

          // Přidej obrázek do databáze
          await this.prisma.image.create({
            data: {
              url: urlData?.publicUrl || `https://lfmfxfazzkpvojhhmnhv.supabase.co/storage/v1/object/public/photos/${filename}`,
              adId: updatedAd.id,
            },
          });
        } catch (err) {
          console.error('❌ File upload error during update:', err);
          if (err instanceof BadRequestException) {
            throw err;
          }
          throw new BadRequestException(`Chyba při nahrávání souboru ${file.originalname}: ${err.message}`);
        }
      }
    }

    return this.prisma.ad.findUnique({
      where: { id },
      include: { images: true, user: true, features: true },
    });
  }

  async remove(id: string) {
    // Nejprve smaž obrázky patřící k inzerátu
    await this.prisma.image.deleteMany({ where: { adId: id } });
    // Pak smaž samotný inzerát
    return this.prisma.ad.delete({ where: { id } });
  }

  async createPhoto(data: { url: string; adId: string }) {
    return this.prisma.image.create({ data });
  }

  async findByUser(userId: string) {
    return this.prisma.ad.findMany({
      where: { userId }, // OPRAVA: použij přímo userId
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePhoto(photoId: string) {
    return this.prisma.image.delete({ where: { id: photoId } });
  }
}
