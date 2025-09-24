import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AdService {
  private supabase;
  private readonly maxImages = 15;
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ✅ HELPER METHODS
  private parseBoolean(value: any): boolean {
    // Handle undefined/null/empty values
    if (value === undefined || value === null || value === '') {
      return false;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      return value.toLowerCase().trim() === 'true';
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Handle numbers (1 = true, 0 = false)
    if (typeof value === 'number') {
      return value === 1;
    }
    
    // Default to false for any other type
    return false;
  }

  private validateImages(files: Express.Multer.File[], minImages = 2) {
    if (!files || files.length < minImages) {
      throw new BadRequestException(`Je nutné nahrát alespoň ${minImages} obrázky`);
    }
    
    if (files.length > this.maxImages) {
      throw new BadRequestException(`Maximální počet obrázků na inzerát je ${this.maxImages}.`);
    }
    
    for (const file of files) {
      if (file.size > this.maxImageSize) {
        throw new BadRequestException(`Soubor ${file.originalname} je příliš velký. Maximální velikost je 10MB.`);
      }
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Nepodporovaný formát souboru ${file.originalname}. Povolené formáty: JPEG, PNG, WebP.`);
      }
    }
  }

  private transformAdData(dto: any) {
    const transformed = {
      ...dto,
      // Numerické hodnoty
      price: dto.price ? Number(dto.price) : undefined,
      mileage: dto.mileage ? Number(dto.mileage) : undefined,
      year: dto.year ? Number(dto.year) : undefined,
      firstRegistration: dto.firstRegistration ? Number(dto.firstRegistration) : undefined,
      doorCount: dto.doorCount ? Number(dto.doorCount) : undefined,
      seatCount: dto.seatCount ? Number(dto.seatCount) : undefined,
      airbagCount: dto.airbagCount ? Number(dto.airbagCount) : undefined, // ✅ ZMĚNĚNO - může být undefined
      engineVolume: dto.engineVolume ? Number(dto.engineVolume) : undefined,
      power: dto.power ? Number(dto.power) : undefined,
      avgConsumption: dto.avgConsumption ? Number(dto.avgConsumption) : undefined,
      gearCount: dto.gearCount ? Number(dto.gearCount) : undefined,
      
      // Boolean hodnoty
      ecoTaxPaid: this.parseBoolean(dto.ecoTaxPaid),
      isFirstOwner: this.parseBoolean(dto.isFirstOwner),
      isDisabledAdapted: this.parseBoolean(dto.isDisabledAdapted),
      wasCrashed: this.parseBoolean(dto.wasCrashed),
      hasServiceBook: this.parseBoolean(dto.hasServiceBook),
      
      // Datumy
      technicalCheckUntil: dto.technicalCheckUntil ? new Date(dto.technicalCheckUntil).toISOString() : undefined,
      warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil).toISOString() : undefined,
      
      // String hodnoty
      airConditioning: dto.airConditioning || undefined,
      euroStandard: dto.euroStandard || undefined,
      description: dto.description || undefined,
      
      // Kontaktní údaje
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail || undefined,
      contactName: dto.contactName || undefined,
      
      // Lokační údaje
      latitude: dto.latitude ? Number(dto.latitude) : undefined,
      longitude: dto.longitude ? Number(dto.longitude) : undefined,
      address: dto.address || undefined,

      // ✅ NOVÉ TEXTOVÉ FIELDS
      safetyFeatures: dto.safetyFeatures || undefined,
      assistSystems: dto.assistSystems || undefined,
      securityFeatures: dto.securityFeatures || undefined,
      interiorComfort: dto.interiorComfort || undefined,
    };

    return transformed;
  }

  private async uploadImages(files: Express.Multer.File[], adId: string, startOrder: number = 0) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('Žádné soubory k uploadu');
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file || !file.buffer) {
        throw new BadRequestException(`Soubor ${i + 1} je poškozený`);
      }

      const fileExtension = path.extname(file.originalname || '.jpg');
      const filename = `ad_${Date.now()}_${i + 1}${fileExtension}`;
      
      const { data, error } = await this.supabase
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

      // ✅ AKTUALIZOVÁNO - zachování pořadí s startOrder
      await this.prisma.image.create({
        data: {
          url: urlData?.publicUrl || `https://lfmfxfazzkpvojhhmnhv.supabase.co/storage/v1/object/public/photos/${filename}`,
          adId: adId,
          order: startOrder + i, // ✅ Zachování správného pořadí
        },
      });
    }
  }

  private async attachUserRatings(ads: any[]) {
    for (const ad of ads) {
      const avg = await this.prisma.review.aggregate({
        where: { targetId: ad.userId },
        _avg: { rating: true },
      });
      (ad.user as any).averageRating = avg._avg.rating;
    }
  }

  private getOrderBy(sortBy: string, sortOrder: string) {
    switch (sortBy) {
      case 'price':
        return { price: sortOrder as 'asc' | 'desc' };
      case 'mileage':
        return { mileage: sortOrder as 'asc' | 'desc' };
      case 'year':
        return { year: sortOrder as 'asc' | 'desc' };
      case 'views':
        return { views: sortOrder as 'asc' | 'desc' };
      case 'title':
        return { title: sortOrder as 'asc' | 'desc' };
      case 'oldest':
        return { createdAt: 'asc' as const };
      case 'newest':
      default:
        return { createdAt: 'desc' as const };
    }
  }

  // ✅ MAIN METHODS
  async create(dto: any, userId: string, files?: Express.Multer.File[]) {
    // ✅ AKTUALIZOVANÁ kontrola limitů podle tier
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isDealer: true, dealerTier: true }
    });

    if (!user) {
      throw new BadRequestException('Uživatel nebyl nalezen');
    }

    const userAdsCount = await this.prisma.ad.count({ where: { userId } });

    // Soukromý uživatel - 10 inzerátů
    if (!user.isDealer) {
      if (userAdsCount >= 10) {
        throw new BadRequestException('Můžete mít maximálně 10 aktivních inzerátů.');
      }
    } else {
      // Dealer - podle tier
      const tierLimits = {
        BASIC: 25,
        PREMIUM: 75,
        ENTERPRISE: 150
      };

      const maxAds = tierLimits[user.dealerTier] || 25;
      
      if (userAdsCount >= maxAds) {
        throw new BadRequestException(
          `Váš ${user.dealerTier} tier umožňuje maximálně ${maxAds} aktivních inzerátů. ` +
          `Pro zvýšení limitu kontaktujte administrátora.`
        );
      }
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Je nutné nahrát alespoň 2 obrázky');
    }

    // Validace obrázků
    this.validateImages(files);

    // Validate required fields before transformation
    const requiredFields = [
      'title', 'brand', 'model', 'price', 'mileage', 'year', 
      'firstRegistration', 'bodyType', 'fuel', 'transmission',
      'contactPhone' // ✅ Only phone is required now
    ];

    const missingFields = requiredFields.filter(field => !dto[field] || dto[field].toString().trim() === '');
    if (missingFields.length > 0) {
      throw new BadRequestException(`Následující pole jsou povinná: ${missingFields.join(', ')}`);
    }

    // Transformace dat
    const transformedData = this.transformAdData(dto);
    
    // ✅ ZMĚNĚNO - airbagCount už není povinný
    const dataToSave = {
      ...transformedData,
      doorCount: transformedData.doorCount ?? 4,
      seatCount: transformedData.seatCount ?? 5,
      gearCount: transformedData.gearCount ?? 5,
      // airbagCount už není potřeba defaultovat
    };
    
    // Remove undefined values but keep 0 values and empty strings for optional fields
    Object.keys(dataToSave).forEach(key => {
      if (dataToSave[key] === undefined) {
        delete dataToSave[key];
      }
    });

    // Vytvoř inzerát
    const ad = await this.prisma.ad.create({
      data: {
        ...dataToSave,
        user: {
          connect: { id: userId }
        }
      },
      include: { images: true, user: true, features: true },
    });

    // Upload obrázků
    try {
      await this.uploadImages(files, ad.id);
    } catch (err) {
      // Rollback - smaž inzerát při chybě uploadu
      await this.prisma.ad.delete({ where: { id: ad.id } });
      throw err;
    }

    // Vrať kompletní inzerát
    return this.prisma.ad.findUnique({
      where: { id: ad.id },
      include: { 
        images: {
          orderBy: { order: 'asc' }
        }, 
        user: true, 
        features: true 
      },
    });
  }

  async findWithFilters(query: any) {
    const sortBy = query.sortBy || 'newest';
    const sortOrder = query.sortOrder || 'desc';
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search, title, brand, model, priceFrom, priceTo, mileage, mileageFrom, mileageTo,
      yearFrom, yearTo, fuel, bodyType, color, colorFinish, powerFrom, powerTo,
      transmission, drivetrain, doorCount, seatCount, condition,
      nearLatitude, nearLongitude, nearDistance
    } = query;

    // Distance filtering
    let distanceFilteredAds: string[] | null = null;
    
    if (nearLatitude && nearLongitude && nearDistance) {
      const lat = parseFloat(nearLatitude);
      const lng = parseFloat(nearLongitude);
      const distance = parseFloat(nearDistance);

      const adsWithLocation = await this.prisma.ad.count({
        where: { latitude: { not: null }, longitude: { not: null } }
      });

      if (adsWithLocation === 0) {
        return {
          ads: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
        };
      }

      const distanceQuery = `
        SELECT id, 
               (6371 * acos(
                 cos(radians($1)) * cos(radians(latitude)) * 
                 cos(radians(longitude) - radians($2)) + 
                 sin(radians($1)) * sin(radians(latitude))
               )) AS distance
        FROM "Ad" 
        WHERE latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND (6371 * acos(
                cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
              )) <= $3
        ORDER BY distance ASC
      `;

      try {
        const nearbyAds = await this.prisma.$queryRawUnsafe(
          distanceQuery, lat, lng, distance
        ) as { id: string; distance: number }[];
        distanceFilteredAds = nearbyAds.map(ad => ad.id);
      } catch (error) {
        distanceFilteredAds = null;
      }
    }

    // Build where clause
    const where: any = {
      title: title ? { contains: title, mode: 'insensitive' } : undefined,
      brand: brand ? { contains: brand, mode: 'insensitive' } : undefined,
      model: model ? { contains: model, mode: 'insensitive' } : undefined,
      price: {
        gte: priceFrom ? Number(priceFrom) : undefined,
        lte: priceTo ? Number(priceTo) : undefined,
      },
      mileage: {
        gte: mileageFrom ? Number(mileageFrom) : undefined,
        lte: mileageTo ? Number(mileageTo) : undefined,
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
      color: color || undefined,
      colorFinish: colorFinish || undefined,
      ...(distanceFilteredAds !== null && { id: { in: distanceFilteredAds } }),
    };

    // Multi-select filters
    const addMultiSelectFilter = (field: string, values: string | string[]) => {
      if (!values) return;
      
      let valuesArray: string[];
      if (Array.isArray(values)) {
        valuesArray = values.filter(v => v && v.trim());
      } else if (typeof values === 'string') {
        try {
          const parsed = JSON.parse(values);
          valuesArray = Array.isArray(parsed) ? parsed : [values];
        } catch {
          valuesArray = values.split(',').map(v => v.trim()).filter(v => v);
        }
      } else {
        return;
      }
      
      if (valuesArray.length > 0) {
        where[field] = { in: valuesArray };
      }
    };

    addMultiSelectFilter('fuel', fuel);
    addMultiSelectFilter('bodyType', bodyType);
    addMultiSelectFilter('transmission', transmission);
    addMultiSelectFilter('drivetrain', drivetrain);
    addMultiSelectFilter('condition', condition);

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) delete where[key];
    });

    const orderBy = this.getOrderBy(sortBy, sortOrder);

    const [ads, total] = await Promise.all([
      this.prisma.ad.findMany({
        where,
        orderBy,
        include: { 
          images: {
            orderBy: { order: 'asc' }  // ✅ Vždy řaď podle pořadí
          }, 
          user: true, 
          features: true 
        },
        skip,
        take: limit
      }),
      this.prisma.ad.count({ where })
    ]);

    // Add distance to results if distance filtering
    if (distanceFilteredAds && nearLatitude && nearLongitude) {
      const lat = parseFloat(nearLatitude);
      const lng = parseFloat(nearLongitude);

      for (const ad of ads) {
        if (ad.latitude && ad.longitude) {
          const R = 6371;
          const dLat = (ad.latitude - lat) * Math.PI / 180;
          const dLon = (ad.longitude - lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(ad.latitude * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          (ad as any).distance = Math.round(distance * 10) / 10;
        }
      }

      if (sortBy === 'distance') {
        ads.sort((a: any, b: any) => {
          const distA = a.distance || 999;
          const distB = b.distance || 999;
          return sortOrder === 'asc' ? distA - distB : distB - distA;
        });
      }
    }

    await this.attachUserRatings(ads);

    return {
      ads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      sortInfo: { sortBy, sortOrder },
      ...(distanceFilteredAds && {
        distanceInfo: {
          centerLatitude: parseFloat(nearLatitude),
          centerLongitude: parseFloat(nearLongitude),
          radiusKm: parseFloat(nearDistance),
          foundAds: distanceFilteredAds.length
        }
      })
    };
  }

  async findAll(query?: any) {
    const sortBy = query?.sortBy || 'newest';
    const sortOrder = query?.sortOrder || 'desc';
    
    const ads = await this.prisma.ad.findMany({
      orderBy: this.getOrderBy(sortBy, sortOrder),
      include: { 
        images: {
          orderBy: { order: 'asc' },
          take: 1 // Pro listing stačí hlavní obrázek
        }, 
        user: true 
      },
    });
    
    await this.attachUserRatings(ads);
    return ads;
  }

  async findOne(id: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { 
        images: {
          orderBy: { order: 'asc' }
        }, 
        user: true, 
        features: true 
      },
    });
    
    if (!ad) {
      throw new NotFoundException(`Inzerát s ID ${id} nebyl nalezen`);
    }
    
    if (!ad.images || ad.images.length === 0) {
      const defaultImage = await this.prisma.image.create({
        data: {
          url: 'https://via.placeholder.com/800x600?text=No+Image+Available',
          adId: ad.id,
        },
      });
      ad.images = [defaultImage];
    }
    
    const avg = await this.prisma.review.aggregate({
      where: { targetId: ad.userId },
      _avg: { rating: true },
    });
    (ad.user as any).averageRating = avg._avg.rating;
    
    return ad;
  }

  async update(id: string, dto: any, userId: string, files?: Express.Multer.File[]) {
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

    // ✅ PŘIDÁNO - Handle existing images reordering
    if (dto.existingImagesOrder && Array.isArray(dto.existingImagesOrder)) {
      console.log('🔍 Processing existingImagesOrder:', dto.existingImagesOrder);
      
      // Update order of existing images
      for (let i = 0; i < dto.existingImagesOrder.length; i++) {
        const imageId = dto.existingImagesOrder[i];
        await this.prisma.image.updateMany({
          where: { 
            id: imageId,
            adId: id // Ensure the image belongs to this ad
          },
          data: { order: i }
        });
      }
    }

    // Handle image deletion
    if (dto.imagesToDelete && Array.isArray(dto.imagesToDelete)) {
      console.log('🔍 Processing imagesToDelete:', dto.imagesToDelete);
      
      for (const imageId of dto.imagesToDelete) {
        const imageToDelete = await this.prisma.image.findUnique({
          where: { id: imageId }
        });

        if (imageToDelete && imageToDelete.adId === id) {
          // Delete from storage
          const fileName = imageToDelete.url.split('/').pop();
          if (fileName) {
            await this.supabase.storage.from('photos').remove([fileName]);
          }
          // Delete from database
          await this.prisma.image.delete({ where: { id: imageId } });
        }
      }
    }

    // Transform and update ad data
    const transformedData = this.transformAdData(dto);

    // Remove undefined values and the order arrays (they're processed above)
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined || transformedData[key] === '' || 
          key === 'imagesToDelete' || key === 'existingImagesOrder') {
        delete transformedData[key];
      }
    });

    const updatedAd = await this.prisma.ad.update({
      where: { id },
      data: transformedData,
      include: { 
        images: {
          orderBy: { order: 'asc' }  // ✅ Order by the order field
        }, 
        user: true, 
        features: true 
      },
    });

    // Upload new images
    if (files && files.length > 0) {
      this.validateImages(files, 0);
      
      // Get the highest order from existing images
      const maxOrder = await this.prisma.image.findFirst({
        where: { adId: id },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      
      const startOrder = maxOrder ? maxOrder.order + 1 : 0;
      await this.uploadImages(files, updatedAd.id, startOrder);
    }

    // Check minimum image count
    const currentImageCount = await this.prisma.image.count({
      where: { adId: id }
    });

    if (currentImageCount < 2) {
      throw new BadRequestException('Inzerát musí mít alespoň 2 obrázky. Přidejte další obrázky.');
    }

    return this.prisma.ad.findUnique({
      where: { id },
      include: { 
        images: {
          orderBy: { order: 'asc' }  // ✅ Always order by order field
        }, 
        user: true, 
        features: true 
      },
    });
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await this.prisma.ad.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    } catch (error) {
      // Ignore if ad doesn't exist
    }
  }

  async remove(id: string) {
    await this.prisma.image.deleteMany({ where: { adId: id } });
    return this.prisma.ad.delete({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.prisma.ad.findMany({
      where: { userId },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPhoto(data: { url: string; adId: string }) {
    return this.prisma.image.create({ data });
  }

  async deletePhoto(photoId: string) {
    return this.prisma.image.delete({ where: { id: photoId } });
  }
}