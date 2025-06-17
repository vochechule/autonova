import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async createUser(email: string, password: string, name: string) {
    return prisma.user.create({ data: { email, password, name } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}
