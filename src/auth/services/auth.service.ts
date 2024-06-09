import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/users/user.repository';
import { EmailConfirmationService } from './emailConfirmation.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  async singUp(singupDto: SignupDto) {
    const existingUser = await this.userRepository.findByEmail(singupDto.email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(singupDto.password, 10);

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

  async confirmEmail(token: string) {
    const email =
      await this.emailConfirmationService.decodeConfirmationToken(token);

    await this.emailConfirmationService.confirmEmail(email);
  }
}
