import { IsEnum } from 'class-validator';
import { ReactionTypes } from 'src/types/enum';

export class UpdateReactionDto {
  @IsEnum(ReactionTypes)
  type: ReactionTypes;
}
