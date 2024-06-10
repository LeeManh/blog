import { UpdateCommentDto } from './dtos/update-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayload } from 'src/auth/types/token-payload.interface';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postService: PostsService,
  ) {}

  async createComment(user: TokenPayload, createCommentDto: CreateCommentDto) {
    const { content, postId } = createCommentDto;

    const post = await this.postService.findPostById(postId);

    const newComment = this.commentsRepository.create({
      content,
      post,
      user: { id: user.id },
    });

    await this.commentsRepository.save(newComment);

    return {
      message: 'Comment created successfully',
    };
  }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: TokenPayload,
  ) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.postService.checkOwnership(comment.post.id, user.id);

    await this.commentsRepository
      .createQueryBuilder('comment')
      .update()
      .set(updateCommentDto)
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Comment updated successfully',
    };
  }

  async deleteComment(id: number, user: TokenPayload) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.postService.checkOwnership(comment.post.id, user.id);

    await this.commentsRepository
      .createQueryBuilder('comment')
      .delete()
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Comment deleted successfully',
    };
  }

  async findCommentById(id: number) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async findCommentsByPostId(postId: number) {
    return await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.post = :postId', { postId })
      .getMany();
  }

  async findAllComments() {
    return await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .getMany();
  }
}
