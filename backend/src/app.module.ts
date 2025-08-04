import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdModule } from './ad/ad.module';
import { SavedAdModule } from './saved-ad/saved-ad.module';
import { PrismaModule } from './prisma/prisma.module'; // OPRAVA: importuj modul, ne službu!
import { MulterModule } from '@nestjs/platform-express';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AdminModule,
    AdModule,
    SavedAdModule,
    PrismaModule, // OPRAVA: přidej do imports!
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService], // ODEBER PrismaService odsud!
})
export class AppModule {}
