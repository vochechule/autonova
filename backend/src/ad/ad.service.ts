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

  findAll() {
    return this.prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findOne(id: number) {
    return this.prisma.ad.findUnique({ where: { id } });
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
}
