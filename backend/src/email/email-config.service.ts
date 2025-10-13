import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfigService {
  constructor(private configService: ConfigService) {}

  checkEmailConfiguration(): boolean {
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      const value = this.configService.get<string>(varName);
      if (!value) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      console.error('❌ Missing email environment variables:', missingVars);
      return false;
    }

    console.log('✅ All email environment variables are configured');
    return true;
  }

  getEmailConfig() {
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
      from: this.configService.get<string>('EMAIL_FROM'),
    };
  }

  logEmailConfig() {
    const config = this.getEmailConfig();
    console.log('📧 Email Configuration Status:', {
      host: config.host || 'NOT_SET',
      port: config.port || 'NOT_SET',
      user: config.user ? `${config.user.substring(0, 3)}***` : 'NOT_SET',
      passSet: !!config.pass,
      from: config.from || 'NOT_SET',
    });
  }
}