import { Injectable } from '@nestjs/common';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu podle projektu

@Injectable()
export class AdService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId: string, files?: Express.Multer.File[]) {
    // Kontrola userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Import fs a path pro práci se soubory
    const fs = require('fs');
    const path = require('path');

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

    // Vytvořit inzerát BEZ features a bez duplicity user connect
    const ad = await this.prisma.ad.create({
      data,
      include: { images: true, user: true, features: true },
    });

    // Zpracovat features, pokud existují
    if (features && typeof features === 'string') {
      const featureNames = features.split(',').map(f => f.trim()).filter(Boolean);
      
      for (const featureName of featureNames) {
        // Vytvoř vlastnost, pokud neexistuje, a připoj ji k inzerátu
        await this.prisma.carFeature.upsert({
          where: { name: featureName },
          create: { 
            name: featureName,
            ads: { connect: { id: ad.id } }
          },
          update: { 
            ads: { connect: { id: ad.id } }
          },
        });
      }
    }

    // Zpracovat obrázky, pokud existují
    if (files && files.length > 0) {
      for (const file of files) {
        const filename = `${Date.now()}_${file.originalname}`;
        const uploadsDir = './uploads';
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        
        await this.prisma.image.create({
          data: {
            url: `/uploads/${filename}`,
            adId: ad.id,
          },
        });
      }
    }

    // Vrátit inzerát s obrázky a features
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

  findOne(id: string) {
    return this.prisma.ad.findUnique({
      where: { id },
      include: { images: true, features: true, user: true },
    });
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
