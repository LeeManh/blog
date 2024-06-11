import { Post } from 'src/posts/entities/post.entity';
import { ReactionTypes } from 'src/types/enum';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reactions' })
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ReactionTypes, default: ReactionTypes.DEFAULT })
  type: ReactionTypes;

  @ManyToOne(() => User, (user) => user.reactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.reactions)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
