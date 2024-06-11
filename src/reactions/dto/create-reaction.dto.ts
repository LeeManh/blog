import { IsEnum, IsOptional } from 'class-validator';
import { ReactionTypes } from 'src/types/enum';

export class CreateReactionDto {
  @IsOptional()
  @IsEnum(ReactionTypes)
  type: ReactionTypes;
}
