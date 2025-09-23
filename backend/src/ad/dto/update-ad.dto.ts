import { PartialType } from '@nestjs/mapped-types';
import { CreateAdDto } from './create-ad.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdDto extends PartialType(CreateAdDto) {
  // ✅ Add transform to handle JSON string parsing BEFORE validation
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Log pro debugging
    console.log('🔍 Transform imagesToDelete:', value, typeof value);

    if (!value) return undefined;

    // Pokud je už array, vrať ho
    if (Array.isArray(value)) return value;

    // Pokud je string, zkus ho parsovat jako JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          console.log('✅ Successfully parsed JSON array:', parsed);
          return parsed;
        }
        // Pokud JSON není array, wrapiť to do array
        console.log('⚠️ JSON parsed but not array, wrapping:', parsed);
        return [parsed];
      } catch (error) {
        // Pokud JSON parsing selže, považuj to za single string
        console.log('⚠️ JSON parse failed, treating as single string:', value);
        return [value];
      }
    }

    console.log('⚠️ Unknown type, returning undefined:', typeof value);
    return undefined;
  })
  imagesToDelete?: string[];
}
