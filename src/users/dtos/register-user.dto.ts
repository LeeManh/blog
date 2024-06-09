import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
