import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { TokenPayload } from 'src/auth/types/token-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.createComment(user, createCommentDto);
  }

  @Patch(':id')
  updateComment(
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: number,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, user);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: number, @CurrentUser() user: TokenPayload) {
    return this.commentsService.deleteComment(id, user);
  }

  @Get()
  findAllComments() {
    return this.commentsService.findAllComments();
  }

  @Post('find-by-post-id')
  findCommentsByPostId(@Body('postId') postId: number) {
    return this.commentsService.findCommentsByPostId(postId);
  }
}
