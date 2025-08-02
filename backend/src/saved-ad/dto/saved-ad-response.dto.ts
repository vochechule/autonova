export class SavedAdResponseDto {
  id: string;
  adId: string;
  userId: string;
  createdAt: Date;
  ad: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    image_url?: string | null;
    createdAt: Date;
  };
} 