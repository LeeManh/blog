import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  public createReaction(
    @Body() createReactionDto: CreateReactionDto,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.createReaction(createReactionDto, user);
  }

  @Get('my-reaction')
  public findMyReactionInPost(
    @Body('postId') postId: number,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.findMyReactionInPost(postId, user);
  }

  @Get('post-reactions')
  public getReactionsByPostId(@Body('postId') postId: number) {
    return this.reactionsService.getReactionsByPostId(postId);
  }

  @Put(':id')
  public updateReaction(
    @Body() updateReaction: UpdateReactionDto,
    @Param('id') postId: number,
    @CurrentUser() user: User,
  ) {
    return this.reactionsService.updateReaction(updateReaction, postId, user);
  }
}
