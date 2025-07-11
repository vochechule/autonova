import {
  BodyType,
  AirConditioning,
  FuelType,
  Transmission,
  Drivetrain,
  EmissionClass,
  CarCondition,
} from '../enums/ad.enums'
import { IsEnum, IsInt, IsString, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator'

export class CreateAdDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsInt()
  price: number

  @IsInt()
  mileage: number

  @IsOptional()
  @IsInt()
  year?: number

  @IsOptional()
  @IsInt()
  firstRegistration?: number

  @IsEnum(BodyType)
  bodyType: BodyType

  @IsInt()
  doorCount: number

  @IsInt()
  seatCount: number

  @IsString()
  color: string

  @IsOptional()
  @IsString()
  colorFinish?: string

  @IsInt()
  airbagCount: number

  @IsEnum(AirConditioning)
  airConditioning: AirConditioning

  @IsEnum(FuelType)
  fuel: FuelType

  @IsInt()
  engineVolume: number

  @IsInt()
  power: number

  @IsOptional()
  @IsInt()
  avgConsumption?: number

  @IsEnum(Transmission)
  transmission: Transmission

  @IsOptional()
  @IsInt()
  gearCount?: number

  @IsEnum(Drivetrain)
  drivetrain: Drivetrain

  @IsEnum(CarCondition)
  condition: CarCondition

  @IsOptional()
  @IsDateString()
  technicalCheckUntil?: string

  @IsString()
  countryOfOrigin: string

  @IsEnum(EmissionClass)
  euroStandard: EmissionClass

  @IsBoolean()
  ecoTaxPaid: boolean

  @IsBoolean()
  isFirstOwner: boolean

  @IsBoolean()
  isDisabledAdapted: boolean

  @IsBoolean()
  wasCrashed: boolean

  @IsBoolean()
  hasServiceBook: boolean

  @IsOptional()
  @IsDateString()
  warrantyUntil?: string

  @IsOptional()
  @IsString()
  windowNote?: string

  @IsOptional()
  @IsArray()
  features?: string[]
}
