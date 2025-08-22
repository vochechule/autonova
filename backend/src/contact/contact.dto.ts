import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class ContactDto {
  @IsNotEmpty({ message: 'Jméno je povinné.' })
  name: string;

  @IsEmail({}, { message: 'Neplatný e-mail.' })
  email: string;

  @IsNotEmpty({ message: 'Zpráva je povinná.' })
  @MinLength(5, { message: 'Zpráva je příliš krátká.' })
  message: string;

  // Honeypot pole (skryté, nemusí být vyplněné)
  @IsOptional()
  website?: string;
}