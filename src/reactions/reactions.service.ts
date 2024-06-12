import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { TokenPayload } from 'src/auth/types/token-payload.interface';
import { ReactionTypes } from 'src/types/enum';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
  ) {}

  async createReaction(
    createReactionDto: CreateReactionDto,
    user: TokenPayload,
  ) {
    await this.reactionsRepository
      .createQueryBuilder('reaction')
      .insert()
      .values({
        ...createReactionDto,
        type: createReactionDto.type ?? ReactionTypes.DEFAULT,
        user: { id: user.id },
        post: { id: createReactionDto.postId },
      })
      .execute();

    return {
      message: 'Reaction created successfully',
    };
  }

  async findMyReactionInPost(postId: number, user: TokenPayload) {
    const reaction = await this.reactionsRepository
      .createQueryBuilder('r')
      .where('r.post.id = :postId', { postId })
      .andWhere('r.user.id = :userId', { userId: user.id })
      .getOne();

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    return reaction;
  }

  async getReactionsByPostId(postId: number) {
    const reactions = await this.reactionsRepository
      .createQueryBuilder('r')
      .where('r.post.id = :postId', { postId })
      .getMany();

    return reactions;
  }

  async updateReaction(
    updateReaction: UpdateReactionDto,
    postId: number,
    user: TokenPayload,
  ) {
    const reaction = await this.findMyReactionInPost(postId, user);

    reaction.type = updateReaction.type;

    await this.reactionsRepository.save(reaction);

    return {
      message: 'Reaction updated successfully',
    };
  }
}
