import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // ✅ OPRAVENO - createTransport místo createTransporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Obnovení hesla - AutoNova</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            🚗 AutoNova
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            Obnovení hesla
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Zapomněli jste heslo?
          </h2>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px;">
            Obdrželi jsme požadavek na obnovení hesla pro váš účet. Klikněte na tlačítko níže pro vytvoření nového hesla.
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: transform 0.2s ease;">
              🔑 Obnovit heslo
            </a>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; font-weight: 600;">
              ⚠️ Bezpečnostní upozornění:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.5;">
              <li>Tento link platí pouze <strong>24 hodin</strong></li>
              <li>Pokud jste o obnovení hesla nežádali, ignorujte tento email</li>
              <li>Nikdy nesdílejte tento link s nikým jiným</li>
            </ul>
          </div>

          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
            Pokud tlačítko nefunguje, zkopírujte tento link do prohlížeče:<br>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 14px;">
            © 2025 AutoNova - Váš spolehlivý partner pro prodej aut
          </p>
          <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
            Tento email byl odeslán na ${email}
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: '🔑 AutoNova - Obnovení hesla',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}