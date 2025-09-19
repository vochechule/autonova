import { Body, Controller, Post, Req, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ContactDto } from './contact.dto';
import { ContactService } from './contact.service';
import { Request } from 'express';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX = 3;
const ipRequests = new Map<string, { count: number; last: number }>();

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);
  
  constructor(private readonly contactService: ContactService) {}

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
      // ✅ Pokus o odeslání e-mailu, ale nezdařte požadavek, pokud se to nepodaří
      await this.contactService.sendContactMail(body.name, body.email, body.message);
      this.logger.log(`Kontaktní formulář úspěšně odeslán uživatelem ${body.email}`);
      return { ok: true, message: 'Zpráva byla úspěšně odeslána.' };
    } catch (error) {
      // ✅ Zalogujte chybu, ale stále vraťte úspěch uživateli
      this.logger.error(`Nepodařilo se odeslat kontaktní e-mail: ${error.message}`, error.stack);
      
      // ✅ Můžete si vybrat buďto:
      // Možnost 1: Vrátit chybu uživateli
      throw new HttpException('Zprávu se nepodařilo odeslat. Zkuste to prosím později.', HttpStatus.INTERNAL_SERVER_ERROR);
      
      // Možnost 2: Uložit do databáze místo toho a vrátit úspěch
      // return { ok: true, message: 'Zpráva byla přijata a bude zpracována.' };
    }
  }
}