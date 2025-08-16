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
                         'drivetrain', 'condition', 'countryOfOrigin',
                         'contactPhone', 'contactEmail']; // ✅ PŘIDÁNO

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
      
      // ✅ PŘIDÁNO - Kontaktní údaje
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      contactName: dto.contactName || undefined,
      
      // ✅ PŘIDÁNO - Lokační údaje
      latitude: dto.latitude ? Number(dto.latitude) : undefined,
      longitude: dto.longitude ? Number(dto.longitude) : undefined,
      address: dto.address || undefined,
      
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
  console.log('🔍 Backend received ALL query params:', JSON.stringify(query, null, 2));
  
  // ✅ PŘIDÁNO - Více detailní debug
  const nearLatitude = query.nearLatitude;
  const nearLongitude = query.nearLongitude;
  const nearDistance = query.nearDistance;
  
  console.log('🗺️ Location params check:', {
    nearLatitude: nearLatitude,
    nearLongitude: nearLongitude,
    nearDistance: nearDistance,
    hasLat: !!nearLatitude,
    hasLng: !!nearLongitude,
    hasDist: !!nearDistance
  });

  // ✅ PŘIDÁNO PAGINATION PARAMETRY
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
    colorFinish,
    powerFrom,
    powerTo,
    transmission,
    drivetrain,
    doorCount,
    seatCount,
    condition,
  } = query;

  // ✅ DISTANCE FILTERING LOGIKA
  let distanceFilteredAds: string[] | null = null;
  
  if (nearLatitude && nearLongitude && nearDistance) {
    const lat = parseFloat(nearLatitude);
    const lng = parseFloat(nearLongitude);
    const distance = parseFloat(nearDistance);

    console.log(`🗺️ Starting distance filtering: ${distance}km from (${lat}, ${lng})`);

    // Nejdřív zkontrolujte kolik inzerátů má lokaci
    const adsWithLocation = await this.prisma.ad.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log(`📊 Total ads with location: ${adsWithLocation}`);

    if (adsWithLocation === 0) {
      console.log('⚠️ No ads have location data!');
      return {
        ads: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    // ✅ OPRAVENÉ SQL - bez HAVING, s WHERE
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
      console.log('🗄️ Executing distance query...');
      const nearbyAds = await this.prisma.$queryRawUnsafe(
        distanceQuery,
        lat,
        lng,
        distance
      ) as { id: string; distance: number }[];

      console.log(`✅ Distance query result: ${nearbyAds.length} ads found`);
      console.log('📍 First 3 results:', nearbyAds.slice(0, 3));

      distanceFilteredAds = nearbyAds.map(ad => ad.id);
      
    } catch (error) {
      console.error('❌ Distance filtering SQL error:', error);
      // Pokud distance filtering selže, pokračujeme bez něj
      distanceFilteredAds = null;
    }
  }

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
    
    // ✅ DISTANCE FILTER DO WHERE
    ...(distanceFilteredAds !== null && { id: { in: distanceFilteredAds } }),
  };

  // Helper funkce pro zpracování multi-select filtrů
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

  // Aplikuj multi-select filtry
  addMultiSelectFilter('fuel', fuel);
  addMultiSelectFilter('bodyType', bodyType);
  addMultiSelectFilter('transmission', transmission);
  addMultiSelectFilter('drivetrain', drivetrain);
  addMultiSelectFilter('condition', condition);

  // Jednoduchý filtr pro barvu
  if (color) {
    where.color = color;
  }

  if (colorFinish) {
    where.colorFinish = colorFinish;
  }

  // Přidej fulltextové vyhledávání
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Odstraň undefined hodnoty
  Object.keys(where).forEach(key => {
    if (where[key] === undefined) {
      delete where[key];
    }
  });

  console.log('🔍 Final WHERE clause:', JSON.stringify(where, null, 2));



  // ✅ PŘIDEJTE PAGINATION A COUNT
  const [ads, total] = await Promise.all([
    this.prisma.ad.findMany({
      where,
      orderBy: distanceFilteredAds ? 
        // Pokud filtrujeme podle vzdálenosti, seřadíme podle vzdálenosti
        { id: 'asc' } : // Placeholder - skutečné řazení podle vzdálenosti je v SQL query
        { createdAt: 'desc' }, // Jinak podle data vytvoření
      include: { images: true, user: true, features: true },
      skip,
      take: limit
    }),
    this.prisma.ad.count({ where })
  ]);
  console.log(`📊 Final result: ${ads.length} ads returned, ${total} total`);


  // ✅ PŘIDÁNO - Přidej vzdálenost k výsledkům pokud filtrujeme podle lokace
  if (distanceFilteredAds && nearLatitude && nearLongitude) {
    const lat = parseFloat(nearLatitude);
    const lng = parseFloat(nearLongitude);

    for (const ad of ads) {
      if (ad.latitude && ad.longitude) {
        // Výpočet vzdálenosti pomocí Haversine formula
        const R = 6371; // Poloměr Země v km
        const dLat = (ad.latitude - lat) * Math.PI / 180;
        const dLon = (ad.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(ad.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        (ad as any).distance = Math.round(distance * 10) / 10; // Zaokrouhli na 1 desetinné místo
      }
    }

    // Seřaď podle vzdálenosti
    ads.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
  }

  // Attach average rating to each ad's user
  for (const ad of ads) {
    const avg = await this.prisma.review.aggregate({
      where: { targetId: ad.userId },
      _avg: { rating: true },
    });
    (ad.user as any).averageRating = avg._avg.rating;
  }

  console.log(`📊 FINAL RESULT: ${ads.length} ads returned out of ${total} total`);
  console.log('🔍 First 2 ad IDs:', ads.slice(0, 2).map(ad => ({ id: ad.id, title: ad.title, hasLocation: !!(ad.latitude && ad.longitude) })));

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
    // Info o distance filtru
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
    // ✅ VYLEPŠENÝ DEBUG
    console.log('🔍 UPDATE SERVICE - DTO keys:', Object.keys(dto));
    console.log('🔍 UPDATE SERVICE - imagesToDelete raw:', dto.imagesToDelete);
    console.log('🔍 UPDATE SERVICE - imagesToDelete type:', typeof dto.imagesToDelete);
    console.log('🔍 UPDATE SERVICE - files count:', files?.length || 0);

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
                         'drivetrain', 'condition', 'countryOfOrigin',
                         'contactPhone', 'contactEmail']; // ✅ PŘIDÁNO

    const missingFields = requiredFields.filter(field => !dto[field] || dto[field] === '');
    if (missingFields.length > 0) {
      throw new Error(`Chybí povinná pole: ${missingFields.join(', ')}`);
    }

    // ✅ VYLEPŠENÉ - Zpracování mazání obrázků
    if (dto.imagesToDelete) {
      let imagesToDelete: string[] = [];
      try {
        console.log('🗑️ Raw imagesToDelete value:', dto.imagesToDelete);
        console.log('🗑️ Type of imagesToDelete:', typeof dto.imagesToDelete);
        
        if (typeof dto.imagesToDelete === 'string') {
          try {
            imagesToDelete = JSON.parse(dto.imagesToDelete);
            console.log('🗑️ Parsed as JSON:', imagesToDelete);
          } catch (parseError) {
            console.log('🗑️ Not JSON, treating as single ID:', dto.imagesToDelete);
            imagesToDelete = [dto.imagesToDelete];
          }
        } else if (Array.isArray(dto.imagesToDelete)) {
          imagesToDelete = dto.imagesToDelete;
          console.log('🗑️ Already array:', imagesToDelete);
        } else {
          console.log('🗑️ Unknown type, converting to string array');
          imagesToDelete = [String(dto.imagesToDelete)];
        }
        
        console.log('🗑️ Final images to delete:', imagesToDelete);

        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          for (const imageId of imagesToDelete) {
            console.log('🗑️ Processing deletion of image ID:', imageId);
            
            // Najdi obrázek v databázi
            const imageToDelete = await this.prisma.image.findUnique({
              where: { id: imageId }
            });

            if (imageToDelete && imageToDelete.adId === id) {
              console.log('🗑️ Found image to delete:', imageToDelete.url);

              // Extrahuj název souboru z URL
              const fileName = imageToDelete.url.split('/').pop();
              if (fileName) {
                console.log('🗑️ Attempting to delete from Supabase:', fileName);
                
                // Smaž ze Supabase storage
                const { error: deleteError } = await this.supabase
                  .storage
                  .from('photos')
                  .remove([fileName]);

                if (deleteError) {
                  console.error('❌ Supabase delete error:', deleteError);
                } else {
                  console.log('✅ Deleted from Supabase:', fileName);
                }
              }

              // Smaž z databáze
              await this.prisma.image.delete({
                where: { id: imageId }
              });
              console.log('✅ Deleted from database:', imageId);
            } else {
              console.log('⚠️ Image not found or doesn\'t belong to this ad:', imageId);
            }
          }
        } else {
          console.log('⚠️ No valid images to delete after processing');
        }
      } catch (error) {
        console.error('❌ Error processing imagesToDelete:', error);
        console.error('❌ Raw imagesToDelete value:', dto.imagesToDelete);
      }
    } else {
      console.log('ℹ️ No images to delete (dto.imagesToDelete is falsy)');
    }

    // Odstraň features a imagesToDelete ze základních dat
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
      
      // Kontaktní údaje
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      contactName: dto.contactName || undefined,
      
      // ✅ PŘIDÁNO - Lokační údaje  
      latitude: dto.latitude ? Number(dto.latitude) : undefined,
      longitude: dto.longitude ? Number(dto.longitude) : undefined,
      address: dto.address || undefined,
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

    // Zpracuj nové obrázky pokud jsou přiloženy
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
          
          console.log('📤 Uploading new file:', filename);
          
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
          
          console.log('✅ New image uploaded and saved:', filename);
        } catch (err) {
          console.error('❌ File upload error during update:', err);
          if (err instanceof BadRequestException) {
            throw err;
          }
          throw new BadRequestException(`Chyba při nahrávání souboru ${file.originalname}: ${err.message}`);
        }
      }
    }

    // ✅ ZMĚNĚNO - Použij updatedAd místo nového query
    // Načti aktuální počet obrázků
    const currentImageCount = await this.prisma.image.count({
      where: { adId: id }
    });

    if (currentImageCount < 2) {
      throw new BadRequestException('Inzerát musí mít alespoň 2 obrázky. Přidejte další obrázky.');
    }

    console.log(`✅ Ad updated successfully. Final image count: ${currentImageCount}`);

    // Vrať kompletní data
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
