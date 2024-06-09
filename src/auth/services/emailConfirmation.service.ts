import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { UserRepository } from 'src/users/user.repository';

interface VerificationTokenPayload {
  email: string;
}

interface ForgotPasswordTokenPayload {
  email: string;
}

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
  ) {}

  public async sendForgotPasswordLink(email: string) {
    const payload: ForgotPasswordTokenPayload = { email };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_FORGOT_PASSWORD_SECRET'),
      expiresIn: `${this.configService.get('JWT_FORGOT_PASSWORD_EXPIRATION_TIME')}s`,
    });

    const url = `${this.configService.get('FORGOT_PASSWORD_URL')}?token=${token}`;

    const text = `To reset the password, click here: ${url}`;

    return await this.emailService.sendMail({
      to: email,
      subject: 'Password reset',
      text,
    });
  }

  public async decodeForgotPasswordToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_FORGOT_PASSWORD_SECRET'),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Forgot password token expired');
      }
      throw new BadRequestException('Bad Forgot password token');
    }
  }

  public async sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`,
    });

    const url = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    return await this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async confirmEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    await this.userRepository.markEmailAsConfirmed(email);
  }

  public async resendConfirmationLink(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.sendVerificationLink(user.email);
  }
}
