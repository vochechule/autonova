import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common'; // ← PŘIDEJTE TENTO IMPORT
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // ← PŘIDEJTE TUTO ČÁST
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  app.enableCors({
    origin: 'http://localhost:3001', // nebo 3000 pokud Next běží tam
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();