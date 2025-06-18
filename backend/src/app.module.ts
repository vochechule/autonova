import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdModule } from './ad/ad.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule, UserModule, AdModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
