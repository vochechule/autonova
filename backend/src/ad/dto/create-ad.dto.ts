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
} from '../enums/ad.enums';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  IsEmail,
  IsPhoneNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateAdDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

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

  // ✅ ZMĚNĚNO - airbagCount je nyní volitelný
  @IsOptional()
  @IsInt({ message: 'Počet airbagů musí být celé číslo' })
  @Min(0, { message: 'Počet airbagů nemůže být záporný' })
  @Max(20, { message: 'Počet airbagů nemůže být více než 20' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  airbagCount?: number;

  @IsOptional()
  @IsEnum(AirConditioning)
  airConditioning?: AirConditioning;

  @IsEnum(FuelType)
  fuel: FuelType;

  @IsEnum(Transmission)
  transmission: Transmission;

  @IsEnum(Drivetrain)
  drivetrain: Drivetrain;

  @IsEnum(CarCondition)
  condition: CarCondition;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsEnum(EmissionClass)
  euroStandard?: EmissionClass;

  @Type(() => Number)
  @IsInt()
  engineVolume: number;

  @Type(() => Number)
  @IsInt()
  power: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  avgConsumption?: number;

  @Type(() => Number)
  @IsInt()
  gearCount: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  // Boolean hodnoty
  @IsOptional()
  ecoTaxPaid?: any;

  @IsOptional()
  isFirstOwner?: any;

  @IsOptional()
  isDisabledAdapted?: any;

  @IsOptional()
  wasCrashed?: any;

  @IsOptional()
  hasServiceBook?: any;

  @IsOptional()
  @IsDateString()
  technicalCheckUntil?: string;

  @IsOptional()
  @IsDateString()
  warrantyUntil?: string;

  // Kontaktní údaje
  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  // Lokační údaje
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;

  // ✅ NOVÉ TEXTOVÉ FIELDS
  @IsOptional()
  @IsString()
  safetyFeatures?: string; // Bezpečnostní systémy

  @IsOptional()
  @IsString()
  assistSystems?: string; // Asistenční systémy

  @IsOptional()
  @IsString()
  securityFeatures?: string; // Zabezpečení vozidla

  @IsOptional()
  @IsString()
  interiorComfort?: string; // Vnitřní výbava a komfort
}
