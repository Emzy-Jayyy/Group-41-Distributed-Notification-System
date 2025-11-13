import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Preference } from './entities/preference.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Preference) private readonly prefRepo: Repository<Preference>,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.connect();
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create({
      email: dto.email,
      password_hash: dto.password,
    });
    await this.userRepo.save(user);

    const pref = this.prefRepo.create({ user });
    await this.prefRepo.save(pref);

    // publish to routing key 'email.queue'
    await this.rabbitmqService.publish('email.queue', {
      type: 'welcome_email',
      to: user.email,
      subject: 'Welcome to Team Cloud!',
      body: `Hi ${user.email}, your account has been created.`,
      user_id: user.id,
    });

    return {
      success: true,
      data: user,
      message: 'User created and welcome email queued.',
    };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['preference'],
    });
    return { success: true, data: user, message: 'ok' };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async getPreferences(id: string) {
    const pref = await this.prefRepo.findOne({ where: { user: { id } } });
    return { success: true, data: pref, message: 'ok' };
  }

  async updatePreferences(id: string, dto: UpdatePreferenceDto) {
    const pref = await this.prefRepo.findOne({ where: { user: { id } } });
    if (!pref) {
      return { success: false, message: 'Preferences not found', data: null };
    }
    Object.assign(pref, dto);
    await this.prefRepo.save(pref);
    return { success: true, data: pref, message: 'Preferences updated' };
  }
}
