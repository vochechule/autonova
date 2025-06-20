import { IsInt, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class CreateAdDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsInt()
  @Min(0)
  price: number

  @IsInt()
  @Min(0)
  mileage: number;

  @IsInt()
  year: number

  @IsString()
  fuel: string

  @IsString()
  body: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  vin?: string

  @IsOptional()
  @IsString()
  transmission?: string

  @IsOptional()
  @IsInt()
  power?: number

  @IsOptional()
  @IsNumber()
  engineSize?: number

  @IsOptional()
  @IsInt()
  doors?: number

  @IsOptional()
  @IsInt()
  seats?: number

  @IsOptional()
  @IsString()
  drive?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  condition?: string

  //add optional location
  @IsOptional()
  @IsString()
  location?: string
}
