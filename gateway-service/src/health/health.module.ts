import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [RabbitMQModule, RedisModule, SequelizeModule.forFeature([])],
  controllers: [HealthController],
  providers: [HealthService]
})
export class HealthModule {};
