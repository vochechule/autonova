import { Body, Controller, Post, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ContactDto } from './contact.dto';
import { ContactService } from './contact.service';
import { Request } from 'express';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const RATE_LIMIT_MAX = 3;
const ipRequests = new Map<string, { count: number; last: number }>();

@Controller('contact')
export class ContactController {
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

    // Validace
    if (!body.name || !body.email || !body.message) {
      throw new HttpException('Vyplňte všechna pole.', HttpStatus.BAD_REQUEST);
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) {
      throw new HttpException('Neplatný e-mail.', HttpStatus.BAD_REQUEST);
    }
    if (body.message.length < 5) {
      throw new HttpException('Zpráva je příliš krátká.', HttpStatus.BAD_REQUEST);
    }

    await this.contactService.sendContactMail(body.name, body.email, body.message);
    return { ok: true };
  }
}