import {
  BodyType,
  AirConditioning,
  FuelType,
  Transmission,
  Drivetrain,
  EmissionClass,
  CarCondition,
  Color,
  ColorFinish,
} from '../enums/ad.enums'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsNumber } from 'class-validator'

export class CreateAdDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  // ✅ OPRAVA: Přidej @Type pro čísla
  @Type(() => Number)
  @IsInt()
  price: number;

  @Type(() => Number)
  @IsInt()
  mileage: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  firstRegistration?: number;

  @IsEnum(BodyType)
  bodyType: BodyType;

  @Type(() => Number)
  @IsInt()
  doorCount: number;

  @Type(() => Number)
  @IsInt()
  seatCount: number;

  @IsEnum(Color)
  color: Color;

  @IsOptional()
  @IsEnum(ColorFinish)
  colorFinish?: ColorFinish;

  @Type(() => Number)
  @IsInt()
  airbagCount: number;

  @IsOptional() // ✅ PŘIDÁNO - klimatizace nepovinná
  @IsEnum(AirConditioning)
  airConditioning?: AirConditioning; // ✅ ZMĚNĚNO na optional

  @IsEnum(FuelType)
  fuel: FuelType;

  // ✅ PŘIDEJTE TRANSMISSION
  @IsEnum(Transmission)
  transmission: Transmission;

  @IsEnum(Drivetrain)
  drivetrain: Drivetrain;

  // ✅ PŘIDEJTE CONDITION
  @IsEnum(CarCondition)
  condition: CarCondition;

  // ✅ PŘIDEJTE COUNTRY OF ORIGIN
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  // ✅ PŘIDEJTE EURO STANDARD
  @IsOptional()
  @IsEnum(EmissionClass) // ✅ ZMĚNĚNO z @IsString() na @IsEnum()
  euroStandard?: EmissionClass; // ✅ ZMĚNĚNO typ

  @Type(() => Number)
  @IsInt()
  engineVolume: number;

  @Type(() => Number)
  @IsInt()
  power: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }) // ✅ Změna z @IsInt() na @IsNumber()
  avgConsumption?: number;

  @Type(() => Number)
  @IsInt()
  gearCount: number;

  // ✅ Features jako array
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  // Boolean hodnoty s transformací
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  ecoTaxPaid: boolean;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isFirstOwner: boolean;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isDisabledAdapted: boolean;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  wasCrashed: boolean;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  hasServiceBook: boolean;

  // ✅ PŘIDEJTE DATUM FIELDY
  @IsOptional()
  @IsDateString()
  technicalCheckUntil?: string; // ISO string datum

  @IsOptional()
  @IsDateString()
  warrantyUntil?: string; // ISO string datum

  // Ostatní fieldy...
}
