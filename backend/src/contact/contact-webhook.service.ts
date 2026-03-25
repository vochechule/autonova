import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactWebhookService {
  private readonly logger = new Logger(ContactWebhookService.name);

  constructor(private prisma: PrismaService) {}

  async saveAndNotify(name: string, email: string, message: string) {
    try {
      // 1. Save to database first
      const submission = await this.prisma.contactSubmission.create({
        data: { name, email, message, status: 'pending' },
      });

      this.logger.log(`Contact submission saved: ${submission.id}`);

      // 2. Send Discord notification
      await this.sendDiscordNotification(name, email, message, submission.id);

      return submission;
    } catch (error) {
      this.logger.error('Failed to save contact submission:', error);
      throw error;
    }
  }

  private async sendDiscordNotification(
    name: string,
    email: string,
    message: string,
    id: string,
  ) {
    try {
      const discordUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!discordUrl) {
        this.logger.warn('No Discord webhook configured');
        return;
      }

      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '📧 Nový kontaktní formulář z Carta.cz',
              color: 0x007bff, // Blue color
              fields: [
                { name: '👤 Jméno', value: name, inline: true },
                { name: '📧 Email', value: email, inline: true },
                { name: '🆔 ID', value: id, inline: true },
                {
                  name: '💬 Zpráva',
                  value:
                    message.length > 1000
                      ? message.substring(0, 1000) + '...'
                      : message,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: 'Carta.cz Contact Form' },
            },
          ],
        }),
      });

      this.logger.log('Discord notification sent successfully');
    } catch (error) {
      this.logger.warn('Discord notification failed:', error.message);
      // Don't throw - this is optional
    }
  }

  // For admin panel later
  async getAllSubmissions() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status: 'read' },
    });
  }

  // ✅ Add delete method
  async deleteSubmission(id: string) {
    try {
      return await this.prisma.contactSubmission.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete submission: ${error.message}`);
      throw error;
    }
  }
}
