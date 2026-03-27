import { Prisma } from '@prisma/client';

export const publicImageSelect = {
  id: true,
  storageKey: true,
  url: true,
  filename: true,
  mimeType: true,
  size: true,
  originalSize: true,
  width: true,
  height: true,
  order: true,
  adId: true,
} satisfies Prisma.ImageSelect;
