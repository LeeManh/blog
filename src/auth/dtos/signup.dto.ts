import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  userName: string;

  @IsString()
  @IsEmail()
  @MinLength(3)
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
