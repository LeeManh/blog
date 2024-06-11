import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { TokenPayload } from 'src/auth/types/token-payload.interface';
import { ReactionTypes } from 'src/types/enum';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionDto,
    user: TokenPayload,
    postId: number,
  ) {
    await this.reactionsRepository
      .createQueryBuilder('reaction')
      .insert()
      .values({
        ...createReactionDto,
        type: createReactionDto.type ?? ReactionTypes.DEFAULT,
        user: { id: user.id },
        post: { id: postId },
      })
      .execute();

    return {
      message: 'Reaction created successfully',
    };
  }

  async findReactionById(id: number) {
    const reaction = await this.reactionsRepository
      .createQueryBuilder('reaction')
      .where('id = :id', { id });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
  }

  async updateReaction(
    updateReaction: CreateReactionDto,
    user: TokenPayload,
    id: number,
  ) {
    const reaction = await this.reactionsRepository
      .createQueryBuilder('reaction')
      .leftJoinAndSelect('reaction.user', 'user')
      .where('reaction.id = :id', { id })
      .getOne();

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    if (reaction.user.id !== user.id) {
      throw new ForbiddenException('FORBIDDEN');
    }

    // update
    await this.reactionsRepository
      .createQueryBuilder('reaction')
      .update()
      .set(updateReaction)
      .where('reaction.id = :id', { id })
      .execute();

    return {
      message: 'Update reaction successfully',
    };
  }
}
