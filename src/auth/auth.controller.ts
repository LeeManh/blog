import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { AuthService } from './services/auth.service';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('singup')
  singUp(@Body() singupDto: SignupDto) {
    return this.authService.singUp(singupDto);
  }

  @Post('email-confirmation')
  async confirm(@Body() confirmationData: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmationData.token);
  }
}
