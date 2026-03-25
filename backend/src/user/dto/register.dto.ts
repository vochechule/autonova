import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Neplatný formát emailu' })
  @IsNotEmpty({ message: 'Email je povinný' })
  email: string;

  @IsString({ message: 'Heslo musí být text' })
  @MinLength(8, { message: 'Heslo musí mít alespoň 8 znaků' })
  @IsNotEmpty({ message: 'Heslo je povinné' })
  password: string;

  @IsString({ message: 'Jméno musí být text' })
  @MinLength(2, { message: 'Jméno musí mít alespoň 2 znaky' })
  @MaxLength(50, { message: 'Jméno může mít maximálně 50 znaků' })
  @IsNotEmpty({ message: 'Jméno je povinné' })
  name: string;
}
