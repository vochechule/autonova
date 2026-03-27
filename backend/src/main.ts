import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // ✅ Add this import
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // ✅ Enhanced validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // ✅ Reject unknown properties
      transformOptions: {
        enableImplicitConversion: true, // ✅ Auto-convert types
      },
    }),
  );

  // ✅ Add global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const allowedOrigins = [
    'http://127.0.0.1:3100',
    'http://localhost:3100',
    'http://127.0.0.1:3001',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://carta.cz',
    'https://www.carta.cz',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
