import { PartialType } from '@nestjs/mapped-types';
import { CreateAdDto } from './create-ad.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdDto extends PartialType(CreateAdDto) {
  // ✅ imagesToDelete with transform (already working)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return undefined;
  })
  imagesToDelete?: string[];

  // ✅ PŘIDÁNO - existingImagesOrder with same transform
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    console.log('🔍 Transform existingImagesOrder:', value, typeof value);

    if (!value) return undefined;

    // Pokud je už array, vrať ho
    if (Array.isArray(value)) return value;

    // Pokud je string, zkus ho parsovat jako JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          console.log('✅ Successfully parsed existingImagesOrder JSON array:', parsed);
          return parsed;
        }
        // Pokud JSON není array, wrapiť to do array
        console.log('⚠️ JSON parsed but not array, wrapping:', parsed);
        return [parsed];
      } catch (error) {
        // Pokud JSON parsing selže, považuj to za single string
        console.log('⚠️ JSON parse failed for existingImagesOrder, treating as single string:', value);
        return [value];
      }
    }

    console.log('⚠️ Unknown type for existingImagesOrder, returning undefined:', typeof value);
    return undefined;
  })
  existingImagesOrder?: string[];
}
