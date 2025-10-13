import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(
    private emailConfigService: EmailConfigService,
    private emailService: EmailService,
  ) {}

  @Get('config-check')
  checkEmailConfig() {
    const isConfigured = this.emailConfigService.checkEmailConfiguration();
    const config = this.emailConfigService.getEmailConfig();
    
    return {
      configured: isConfigured,
      config: {
        host: config.host || 'NOT_SET',
        port: config.port || 'NOT_SET',
        user: config.user ? `${config.user.substring(0, 3)}***` : 'NOT_SET',
        passSet: !!config.pass,
        from: config.from || 'NOT_SET',
      },
    };
  }

  @Post('test-reset')
  async testPasswordReset(@Body() body: { email: string }) {
    try {
      await this.emailService.sendPasswordResetEmail(body.email, 'test-token-123');
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        error: error.toString(),
      };
    }
  }
}