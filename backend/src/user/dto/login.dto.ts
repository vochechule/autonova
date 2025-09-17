import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Neplatný formát emailu' })
  @IsNotEmpty({ message: 'Email je povinný' })
  email: string;

  @IsString({ message: 'Heslo musí být text' })
  @IsNotEmpty({ message: 'Heslo je povinné' })
  password: string;
}
