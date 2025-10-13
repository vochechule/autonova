import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendGridService {
  private apiKey: string;
  
  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailData = {
      personalizations: [
        {
          to: [{ email }],
          subject: '🔑 AutoNova - Obnovení hesla'
        }
      ],
      from: { 
        email: 'noreply@autonova.cz',
        name: 'AutoNova'
      },
      content: [
        {
          type: 'text/html',
          value: this.getEmailTemplate(resetLink, email)
        }
      ]
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
      }

      console.log('✅ Password reset email sent via SendGrid');
      return { success: true };
    } catch (error) {
      console.error('❌ SendGrid email failed:', error);
      throw new Error('Nepodařilo se odeslat email přes SendGrid');
    }
  }

  private getEmailTemplate(resetLink: string, email: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Obnovení hesla - AutoNova</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚗 AutoNova</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Obnovení hesla</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #1e293b;">Zapomněli jste heslo?</h2>
        <p>Obdrželi jsme žádost o obnovení hesla pro váš účet.</p>
        <p>Pro nastavení nového hesla klikněte na tlačítko níže:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Obnovit heslo
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Pokud jste o obnovení hesla nežádali, tento email ignorujte.
        </p>
        <p style="color: #64748b; font-size: 14px;">
          Odkaz je platný 24 hodin.
        </p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
        © 2025 AutoNova - Email odeslán na ${email}
      </div>
    </body>
    </html>`;
  }
}