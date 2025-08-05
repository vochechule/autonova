import { IsString, IsNumber, IsDate, IsOptional, IsObject } from 'class-validator';

export class SavedAdResponseDto {
  @IsString()
  id: string;

  @IsString()
  adId: string;

  @IsString()
  userId: string;

  @IsDate()
  createdAt: Date;

  @IsObject()
  ad: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number | null;
    image_url?: string | null;
    createdAt: Date;
  };
}