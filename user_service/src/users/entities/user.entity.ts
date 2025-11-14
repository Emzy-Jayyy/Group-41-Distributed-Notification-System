import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Preference } from './preference.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  push_token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => Preference, (pref) => pref.user)
  preference: Preference;
}
