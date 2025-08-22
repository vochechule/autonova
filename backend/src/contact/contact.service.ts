import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  async sendContactMail(name: string, email: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`, // <-- vždy tvůj Zoho e-mail!
      replyTo: `${name} <${email}>`,               // <-- odpověď půjde uživateli
      to: process.env.CONTACT_RECEIVER || 'info@carta.cz',
      subject: 'Zpráva z kontaktního formuláře',
      text: message,
      html: `<p><strong>Jméno:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Zpráva:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`,
    });
  }
}