import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/users/user.repository';
import { EmailConfirmationService } from './emailConfirmation.service';
import { SigninDto } from '../dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { TokenPayload } from '../types/token-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailConfirmationService: EmailConfirmationService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  private async verifyEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.isEmailConfirmed) {
      throw new HttpException('Email not confirmed', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  private async generateJwtToken(user: User) {
    const payload: TokenPayload = { id: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION_TIME'),
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  public async singUp(singupDto: SignupDto) {
    const existingUser = await this.userRepository.findByEmail(singupDto.email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await this.hashPassword(singupDto.password);

    // create user
    const user = this.userRepository.create({
      ...singupDto,
      password: hashedPassword,
    });

    // send verification link
    await this.emailConfirmationService.sendVerificationLink(user.email);

    // save user to db
    return await this.userRepository.save(user);
  }

  public async singIn(signinDto: SigninDto) {
    const user = await this.verifyEmail(signinDto.email);

    await this.verifyPassword(signinDto.password, user.password);

    const { accessToken, refreshToken } = await this.generateJwtToken(user);

    // save refresh token to db
    user.refreshToken = refreshToken;

    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async confirmEmail(token: string) {
    const email =
      await this.emailConfirmationService.decodeConfirmationToken(token);

    await this.emailConfirmationService.confirmEmail(email);
  }

  public async logout(user: TokenPayload) {
    const existingUser = await this.userRepository.findById(user.id);

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // remove refresh token from db
    existingUser.refreshToken = null;

    await this.userRepository.save(existingUser);
  }

  public async sendForgotPasswordLink(email: string) {
    // check if user exists and email is confirmed
    await this.verifyEmail(email);

    // send password reset link
    await this.emailConfirmationService.sendForgotPasswordLink(email);
  }

  public async resetPassword(token: string, newPassword: string) {
    // decode token and get email
    const email =
      await this.emailConfirmationService.decodeForgotPasswordToken(token);

    // verify email
    const user = await this.verifyEmail(email);

    // create new password hash
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;

    // remove refresh token from db
    user.refreshToken = null;

    // save user to db
    await this.userRepository.save(user);
  }
}
