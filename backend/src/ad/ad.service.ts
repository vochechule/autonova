import { Injectable, NotFoundException } from '@nestjs/common';
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
      
      // Ujisti se, že description existuje (je povinné)
      description: dto.description || 'Bez popisu',
      
      // Místo userId použij user.connect
      user: {
        connect: { id: userId }
      }
    };

    // Vytvořit inzerát
    const ad = await this.prisma.ad.create({
      data,
      include: { images: true, user: true, features: true },
    });
    
    // Zpracovat obrázky
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const filename = `${Date.now()}_${file.originalname}`;
          
          console.log('Uploading to Supabase:', filename);
          const { data, error } = await this.supabase
            .storage
            .from('photos') // správný bucket!
            .upload(filename, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          const { data: urlData } = this.supabase
            .storage
            .from('photos') // správný bucket!
            .getPublicUrl(filename);

          await this.prisma.image.create({
            data: {
              url: urlData?.publicUrl || `https://lfmfxfazzkpvojhhmnhv.supabase.co/storage/v1/object/public/photos/${filename}`,
              adId: ad.id,
            },
          });
        } catch (err) {
          console.error('File upload error:', err);
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
    const {
      title,
      priceFrom,
      priceTo,
      mileage,
      yearFrom,
      yearTo,
      fuel,
      bodyType,
      color,
      powerFrom,
      powerTo,
      transmission,
      drivetrain,
      doorCount,
      seatCount,
    } = query;

    return this.prisma.ad.findMany({
      where: {
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
        price: {
          gte: priceFrom ? Number(priceFrom) : undefined,
          lte: priceTo ? Number(priceTo) : undefined,
        },
        mileage: mileage ? { lte: Number(mileage) } : undefined,
        year: {
          gte: yearFrom ? Number(yearFrom) : undefined,
          lte: yearTo ? Number(yearTo) : undefined,
        },
        power: {
          gte: powerFrom ? Number(powerFrom) : undefined,
          lte: powerTo ? Number(powerTo) : undefined,
        },
        fuel: fuel || undefined,
        bodyType: bodyType || undefined,
        color: color || undefined,
        transmission: transmission || undefined,
        drivetrain: drivetrain || undefined,
        doorCount: doorCount ? Number(doorCount) : undefined,
        seatCount: seatCount ? Number(seatCount) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: { images: true, user: true, features: true },
    });
  }

  findAll() {
    return this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, images: true, features: true },
    });
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
    
    return ad;
  }

  async update(id: string, dto: UpdateAdDto) {
    const { features, ...adData } = dto;
    const data: any = {
      ...adData,
      // userId: userId, // ODEBER nebo definuj userId, pokud je potřeba
    };

    Object.keys(data).forEach(key => {
      if (data[key] === undefined) delete data[key];
    });

    if (data.technicalCheckUntil)
      data.technicalCheckUntil = new Date(data.technicalCheckUntil).toISOString();
    if (data.warrantyUntil)
      data.warrantyUntil = new Date(data.warrantyUntil).toISOString();

    return await this.prisma.ad.update({
      where: { id },
      data,
      include: { images: true, features: true, user: true },
    });
  }

  remove(id: string) {
    return this.prisma.ad.delete({ where: { id } });
  }

  async createPhoto(data: { url: string; adId: string }) {
    return this.prisma.image.create({ data });
  }
}
