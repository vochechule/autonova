import { Body, Controller, Post, Get, Patch, Delete, Param, Req, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContactDto } from './contact.dto';
import { ContactWebhookService } from './contact-webhook.service';
import { Request } from 'express';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX = 3;
const ipRequests = new Map<string, { count: number; last: number }>();

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);
  
  constructor(private readonly contactWebhookService: ContactWebhookService) {}

  @Post()
  async sendContact(@Body() body: ContactDto, @Req() req: Request) {
    // Jednoduchý rate limit podle IP
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const now = Date.now();
    const entry = ipRequests.get(ip) || { count: 0, last: now };
    if (now - entry.last > RATE_LIMIT_WINDOW) {
      entry.count = 0;
      entry.last = now;
    }
    entry.count++;
    ipRequests.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      throw new HttpException('Příliš mnoho požadavků, zkuste to později.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Honeypot ochrana (skryté pole, které má být prázdné)
    if ('website' in body && body['website']) {
      throw new HttpException('Spam detekován.', HttpStatus.BAD_REQUEST);
    }

    // ✅ Vylepšená validace s lepšími chybovými hláškami
    if (!body.name || body.name.trim().length === 0) {
      throw new HttpException('Vyplňte jméno.', HttpStatus.BAD_REQUEST);
    }
    if (!body.email || !/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) {
      throw new HttpException('Neplatný e-mail.', HttpStatus.BAD_REQUEST);
    }
    if (!body.message || body.message.trim().length < 5) {
      throw new HttpException('Zpráva musí mít alespoň 5 znaků.', HttpStatus.BAD_REQUEST);
    }

    try {
      // ✅ Uložení do databáze + odeslání notifikace na Discord
      await this.contactWebhookService.saveAndNotify(body.name, body.email, body.message);
      this.logger.log(`Kontaktní formulář úspěšně odeslán uživatelem ${body.email}`);
      return { ok: true, message: 'Zpráva byla úspěšně odeslána.' };
    } catch (error) {
      this.logger.error(`Nepodařilo se zpracovat kontaktní formulář: ${error.message}`);
      throw new HttpException(
        'Nepodařilo se odeslat zprávu. Zkuste to prosím později.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ✅ Admin endpoint pro zobrazení zpráv (přidat autentizaci později)
  @Get('admin/submissions')
  async getSubmissions() {
    try {
      return await this.contactWebhookService.getAllSubmissions();
    } catch (error) {
      throw new HttpException('Nepodařilo se načíst odeslané zprávy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Označit zprávu jako přečtenou
  @Patch('admin/submissions/:id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      return await this.contactWebhookService.markAsRead(id);
    } catch (error) {
      throw new HttpException('Nepodařilo se aktualizovat stav zprávy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ✅ Delete message endpoint - FIXED
  @Delete('admin/submissions/:id')
  async deleteSubmission(@Param('id') id: string) {
    try {
      await this.contactWebhookService.deleteSubmission(id); // ✅ Use the service instead
      return { ok: true, message: 'Zpráva byla smazána.' };
    } catch (error) {
      this.logger.error(`Failed to delete submission: ${error.message}`);
      throw new HttpException('Failed to delete submission', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}