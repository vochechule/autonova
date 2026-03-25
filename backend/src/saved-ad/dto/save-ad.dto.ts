import { IsString, IsUUID } from 'class-validator';

export class SaveAdDto {
  @IsString()
  @IsUUID()
  adId: string;
}
