import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactWebhookService } from './contact-webhook.service';

@Module({
  controllers: [ContactController],
  providers: [ContactWebhookService],
})
export class ContactModule {}