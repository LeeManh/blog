import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { TokenPayload } from 'src/auth/types/token-payload.interface';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  public async profile(user: TokenPayload) {
    return await this.userRepository.findById(user.id);
  }
}
