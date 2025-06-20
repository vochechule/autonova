import { Injectable } from '@nestjs/common';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu podle projektu

@Injectable()
export class AdService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAdDto) {
    try {
      return await this.prisma.ad.create({
        data: {
          ...dto,
          userId,
        },
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
      body,
      color,
      powerFrom,
      powerTo,
      transmission,
      drive,
      doors,
      seats,
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
        body: body || undefined,
        color: color || undefined,
        transmission: transmission || undefined,
        drive: drive || undefined,
        doors: doors ? Number(doors) : undefined,
        seats: seats ? Number(seats) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: { photos: true, user: true },
    });
  }

  findAll() {
    return this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, photos: true },
    });
  }

  findOne(id: number) {
    return this.prisma.ad.findUnique({
      where: { id },
      include: { photos: true },
    });
  }

  update(id: number, dto: UpdateAdDto) {
    return this.prisma.ad.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.ad.delete({ where: { id } });
  }

  async createPhoto(data: { url: string; adId: number }) {
    return this.prisma.photo.create({ data });
  }
}
