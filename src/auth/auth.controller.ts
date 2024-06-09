import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { AuthService } from './services/auth.service';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { SigninDto } from './dtos/signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('singup')
  singUp(@Body() singupDto: SignupDto) {
    return this.authService.singUp(singupDto);
  }

  @Post('signin')
  singIn(@Body() signinDto: SigninDto) {
    return this.authService.singIn(signinDto);
  }

  @Post('email-confirmation')
  async confirm(@Body() confirmationData: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmationData.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe() {
    return 'Hello from me';
  }
}
