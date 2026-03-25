import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const ASSET_URL_KEYS = new Set(['url', 'avatar', 'image_url']);

@Injectable()
export class PublicAssetUrlInterceptor implements NestInterceptor {
  private readonly publicBaseUrl: string | null;

  constructor(private readonly configService: ConfigService) {
    this.publicBaseUrl = this.resolvePublicBaseUrl();
  }

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => this.normalizeAssetUrls(data)));
  }

  private resolvePublicBaseUrl(): string | null {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (frontendUrl) {
      return frontendUrl.replace(/\/+$/, '');
    }

    const apiUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL');

    if (!apiUrl) {
      return null;
    }

    try {
      const parsedUrl = new URL(apiUrl);
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/api\/?$/, '') || '/';
      parsedUrl.search = '';
      parsedUrl.hash = '';
      return parsedUrl.toString().replace(/\/+$/, '');
    } catch {
      return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    }
  }

  private normalizeAssetUrls(value: unknown): unknown {
    if (!this.publicBaseUrl || value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeAssetUrls(item));
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      for (const [key, nestedValue] of Object.entries(record)) {
        if (
          typeof nestedValue === 'string' &&
          this.shouldNormalizeAssetUrl(key, nestedValue)
        ) {
          record[key] = this.toAbsoluteUrl(nestedValue);
          continue;
        }

        record[key] = this.normalizeAssetUrls(nestedValue);
      }
    }

    return value;
  }

  private shouldNormalizeAssetUrl(key: string, value: string): boolean {
    if (!ASSET_URL_KEYS.has(key)) {
      return false;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return false;
    }

    return !this.isAbsoluteUrl(trimmedValue);
  }

  private isAbsoluteUrl(value: string): boolean {
    return /^[a-z][a-z\d+\-.]*:/i.test(value) || value.startsWith('//');
  }

  private toAbsoluteUrl(value: string): string {
    try {
      return new URL(value, `${this.publicBaseUrl}/`).toString();
    } catch {
      const normalizedPath = value.startsWith('/') ? value : `/${value}`;
      return `${this.publicBaseUrl}${normalizedPath}`;
    }
  }
}
