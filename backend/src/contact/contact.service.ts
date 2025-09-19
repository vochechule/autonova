import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  async sendContactMail(name: string, email: string, message: string) {
    try {
      // ✅ Add connection timeout and better error handling
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587, // ✅ Try 587 instead of 465
        secure: Number(process.env.SMTP_PORT) === 465, // ✅ Only secure if port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // ✅ Add timeout settings
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000,     // 60 seconds
        // ✅ Add TLS options for production
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false // Only if you have certificate issues
        }
      });

      // ✅ Verify connection before sending
      await transporter.verify();
      this.logger.log('SMTP connection verified successfully');

      const result = await transporter.sendMail({
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: `${name} <${email}>`,
        to: process.env.CONTACT_RECEIVER || 'info@carta.cz',
        subject: 'Zpráva z kontaktního formuláře',
        text: message,
        html: `<p><strong>Jméno:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Zpráva:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`,
      });

      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return result;

    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}