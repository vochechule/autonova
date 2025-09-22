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

    try {
      // ✅ Enhanced validation with specific error messages
      const errors: string[] = [];
      
      if (!body.name || body.name.trim().length === 0) {
        errors.push('Jméno je povinné');
      } else if (body.name.trim().length < 2) {
        errors.push('Jméno musí mít alespoň 2 znaky');
      } else if (body.name.trim().length > 100) {
        errors.push('Jméno je příliš dlouhé (max 100 znaků)');
      }
      
      if (!body.email || body.email.trim().length === 0) {
        errors.push('E-mail je povinný');
      } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) {
        errors.push('Neplatný formát e-mailu');
      } else if (body.email.length > 254) {
        errors.push('E-mail je příliš dlouhý');
      }
      
      if (!body.message || body.message.trim().length === 0) {
        errors.push('Zpráva je povinná');
      } else if (body.message.trim().length < 5) {
        errors.push('Zpráva musí mít alespoň 5 znaků');
      } else if (body.message.trim().length > 5000) {
        errors.push('Zpráva je příliš dlouhá (max 5000 znaků)');
      }
      
      if (errors.length > 0) {
        throw new HttpException({
          statusCode: 400,
          message: errors,
          error: 'Bad Request'
        }, HttpStatus.BAD_REQUEST);
      }

      // ✅ Uložení do databáze + odeslání notifikace na Discord
      await this.contactWebhookService.saveAndNotify(body.name, body.email, body.message);
      this.logger.log(`Kontaktní formulář úspěšně odeslán uživatelem ${body.email}`);
      return { ok: true, message: 'Zpráva byla úspěšně odeslána.' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
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