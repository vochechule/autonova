import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConfigService } from './email-config.service';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService, EmailConfigService],
  exports: [EmailService, EmailConfigService],
})
export class EmailModule {}
