import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // uprav cestu dle projektu

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, name: string) {
    return this.prisma.user.create({ data: { email, password, name } });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
