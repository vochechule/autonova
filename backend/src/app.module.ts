import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdModule } from './ad/ad.module';
import { SavedAdModule } from './saved-ad/saved-ad.module';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { PublicAssetUrlInterceptor } from './common/interceptors/public-asset-url.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Udělá config dostupný všude
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AdminModule,
    AdModule,
    SavedAdModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PublicAssetUrlInterceptor,
    },
  ],
})
export class AppModule {}
