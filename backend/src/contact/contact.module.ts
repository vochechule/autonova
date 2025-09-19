import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactWebhookService } from './contact-webhook.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ContactController],
  providers: [ContactWebhookService, PrismaService],
})
export class ContactModule {}