import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
// import { TokenPayload } from 'src/auth/types/token-payload.interface';
import { CreatePostDto } from './dtos/create-post.dto';
import { UserRepository } from 'src/users/user.repository';
import { UpdatePostDto } from './dtos/update-post.dto';
import { TokenPayload } from 'src/auth/types/token-payload.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private readonly userRepository: UserRepository,
  ) {}

  public async checkOwnership(id: number, userId: number) {
    const post = await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.id = :id', { id })
      .leftJoinAndSelect('posts.user', 'user')
      .getOne();

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }
  }

  async createPost(userId: number, createPostDto: CreatePostDto) {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id: userId })
      .getOne();

    const post = this.postsRepository.create({
      ...createPostDto,
      user,
    });

    return await this.postsRepository.save(post);
  }

  async findAllPosts() {
    return await this.postsRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.user', 'user')
      .getMany();
  }

  async findPostById(id: number) {
    const post = await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.id = :id', { id })
      .leftJoinAndSelect('posts.user', 'user')
      .getOne();

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    user: TokenPayload,
  ) {
    await this.checkOwnership(id, user.id);

    await this.postsRepository
      .createQueryBuilder('posts')
      .update()
      .set(updatePostDto)
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Post updated successfully',
    };
  }

  async deletePost(id: number, user: TokenPayload) {
    await this.checkOwnership(id, user.id);

    await this.postsRepository
      .createQueryBuilder('posts')
      .delete()
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Post deleted successfully',
    };
  }
}
