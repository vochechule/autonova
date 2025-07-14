import { Injectable } from '@nestjs/common';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu podle projektu

@Injectable()
export class AdService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAdDto) {
    try {
      // Pokud jsou features pole stringů, musíš je převést na relace CarFeature
      const { features, ...adData } = dto;
      const data: any = {
        ...adData,
        userId,
        features: features
          ? {
              connect: features.map((name) => ({ name })),
            }
          : undefined,
      };

      if (data.technicalCheckUntil)
        data.technicalCheckUntil = new Date(data.technicalCheckUntil).toISOString();
      if (data.warrantyUntil)
        data.warrantyUntil = new Date(data.warrantyUntil).toISOString();

      return await this.prisma.ad.create({
        data,
        include: { images: true, user: true, features: true },
      });
    } catch (error) {
      console.error('Chyba při vytváření inzerátu:', error);
      throw error;
    }
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
    // Pokud jsou features pole stringů, musíš je převést na relace CarFeature
    const { features, ...adData } = dto;
    const data: any = {
      ...adData,
      features: features
        ? {
            set: [],
            connect: features.map((name) => ({ name })),
          }
        : undefined,
    };

    return this.prisma.ad.update({
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
