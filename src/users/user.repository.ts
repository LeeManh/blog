import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string) {
    return await this.createQueryBuilder('users')
      .where('users.email = :email', { email })
      .getOne();
  }

  async markEmailAsConfirmed(email: string) {
    return await this.createQueryBuilder('users')
      .where('users.email = :email', { email })
      .update()
      .set({ isEmailConfirmed: true })
      .execute();
  }

  async findById(id: number) {
    return await this.createQueryBuilder('users')
      .where('users.id = :id', { id })
      .getOne();
  }
}
