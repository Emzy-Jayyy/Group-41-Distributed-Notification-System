import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('preferences')
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  email_opt_in: boolean;

  @Column({ default: true })
  push_opt_in: boolean;

  @Column({ default: 'en' })
  locale: string;

  @Column({ default: 60 })
  rate_limit_per_min: number;

  @OneToOne(() => User, (user) => user.preference, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
